
import prisma from '../../config/db.js';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY2 });

// ==========================================
// 1. CREATE LEVEL 1: COURSE (TEMA BESAR / PATH)
// ==========================================
export const createCourse = async (req, res) => {
    try {
        const { title, description, type, price, bannerUrl, originalPrice, category, level, promoVideoUrl, fullDescription, benefits, estimatedHours } = req.body;
        const newCourse = await prisma.course.create({
            data: {
                title,
                description,
                type,
                price: Number(price) || 0,
                bannerUrl,
                originalPrice: originalPrice ? Number(originalPrice) : null,
                category: category || "Semua",
                level: level || "Semua Level",
                promoVideoUrl,
                fullDescription,
                benefits: benefits || [],
                estimatedHours: Number(estimatedHours) || 0
            }
        });
        res.status(201).json({ success: true, message: "Course (Path) berhasil dibuat!", data: newCourse });
    } catch (error) {
        console.error("Error Create Course:", error);
        res.status(500).json({ success: false, message: "Gagal membuat Course." });
    }
};

// ==========================================
// 2. CREATE LEVEL 2: CLASS (KELAS BESAR)
// ==========================================
export const createClass = async (req, res) => {
    try {
        const { courseId, title, description, orderIndex, isPremium } = req.body;
        const newClass = await prisma.class.create({
            data: { courseId, title, description, orderIndex: Number(orderIndex), isPremium }
        });
        res.status(201).json({ success: true, message: "Class berhasil ditambah ke Course!", data: newClass });
    } catch (error) {
        console.error("Error Create Class:", error);
        res.status(500).json({ success: false, message: "Gagal menambahkan Class." });
    }
};

// ==========================================
// 3. CREATE LEVEL 3: BRANCH CLASS (CABANG TOPIK)
// ==========================================
export const createBranchClass = async (req, res) => {
    try {
        const { classId, title, orderIndex } = req.body;
        const newBranch = await prisma.branchClass.create({
            data: { classId, title, orderIndex: Number(orderIndex) }
        });
        // Auto-create first SmallBranch (Materi 1) inside the new Branch
        await prisma.smallBranch.create({
            data: {
                branchClassId: newBranch.id,
                title: 'Materi 1',
                content: '<p>Tulis konten materi di sini...</p>',
                orderIndex: 1
            }
        });
        res.status(201).json({ success: true, message: "Branch Class sukses dibuat! (Materi 1 otomatis ditambahkan)", data: newBranch });
    } catch (error) {
        console.error("Error Create Branch:", error);
        res.status(500).json({ success: false, message: "Gagal membuat Branch Class." });
    }
};

// ==========================================
// 4. CREATE LEVEL 4: SMALL BRANCH (MATERI TEKS / NO QUIZ)
// ==========================================
export const createSmallBranch = async (req, res) => {
    try {
        const { branchClassId, title, content, orderIndex } = req.body;
        const newSmallBranch = await prisma.smallBranch.create({
            data: { branchClassId, title, content, orderIndex: Number(orderIndex) }
        });
        res.status(201).json({ success: true, message: "Materi (Small Branch) tersimpan!", data: newSmallBranch });
    } catch (error) {
        console.error("Error Create Small Branch:", error);
        res.status(500).json({ success: false, message: "Gagal menyimpan materi." });
    }
};

// ==========================================
// 5. GENERATE QUIZ AI (Nempel ke BranchClass)
// ==========================================
export const generateQuizAI = async (req, res) => {
    try {
        const { branchClassId } = req.body; // Sekarang nembaknya ke BranchClass, bukan Stage

        if (!branchClassId) {
            return res.status(400).json({ success: false, message: "Error: branchClassId kosong!" });
        }

        // 1. Ambil SEMUA materi teks dari SmallBranches yang ada di dalam BranchClass ini
        const smallBranches = await prisma.smallBranch.findMany({
            where: { branchClassId: branchClassId },
            orderBy: { orderIndex: 'asc' }
        });

        if (smallBranches.length === 0) {
            return res.status(404).json({ success: false, message: "Belum ada materi (Small Branch) di cabang ini buat dibaca AI!" });
        }

        // Gabungin semua teks materi jadi satu buat dikasih ke AI
        const fullContent = smallBranches.map(sb => sb.content).join("\n\n");

        // 2. Siapin Prompt Sakti buat AI
        const systemPrompt = `Kamu adalah pembuat soal e-learning profesional. 
        Tugasmu: Buat 5 soal pilihan ganda berdasarkan teks materi yang diberikan.
        SYARAT MUTLAK: Jawabanmu HARUS berupa array JSON murni. Jangan tambahkan teks intro/penutup. Jangan gunakan markdown \`\`\`json.
        Format JSON yang wajib diikuti untuk setiap soal:
        [
          {
            "question": "Pertanyaan disini?",
            "optionA": "Pilihan A",
            "optionB": "Pilihan B",
            "optionC": "Pilihan C",
            "optionD": "Pilihan D",
            "correctAnswer": "A" // Hanya huruf A, B, C, atau D
          }
        ]`;

        // 3. Tembak ke API Groq
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Buatkan 5 soal dari materi gabungan ini:\n\n${fullContent}` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
        });

        let aiResponse = chatCompletion.choices[0]?.message?.content || "[]";
        aiResponse = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();

        const quizzesJSON = JSON.parse(aiResponse);

        // 4. Masukin hasil JSON langsung ke Database PostgreSQL lu!
        const savedQuizzes = await Promise.all(
            quizzesJSON.map(async (q) => {
                return await prisma.quiz.create({
                    data: {
                        branchClassId: branchClassId, // Nempelnya ke BranchClass sekarang
                        question: q.question,
                        optionA: q.optionA,
                        optionB: q.optionB,
                        optionC: q.optionC,
                        optionD: q.optionD,
                        correctAnswer: q.correctAnswer
                    }
                });
            })
        );

        res.status(201).json({ success: true, message: "5 Soal AI berhasil dibuat!", data: savedQuizzes });

    } catch (error) {
        console.error("Error Generate AI Quiz:", error);
        res.status(500).json({ success: false, message: "Gagal memproses AI Quiz." });
    }
};

// ==========================================
// 6. CREATE MANUAL QUIZ (Nempel ke BranchClass)
// ==========================================
export const createManualQuiz = async (req, res) => {
    try {
        // 👇 TAMBAHIN imageUrl DI SINI 👇
        const { courseId, classId, branchClassId, question, optionA, optionB, optionC, optionD, correctAnswer, imageUrl } = req.body;

        // 👇 MASUKIN imageUrl KE DALAM OBJEK DATA 👇
        const data = {
            question,
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer,
            imageUrl: imageUrl || null // Kalau kosong, jadikan null biar database aman
        };

        if (courseId) data.courseId = courseId;           // Ujian Akhir Path (Level 1)
        if (classId) data.classId = classId;             // Evaluasi Bab (Level 2)
        if (branchClassId) data.branchClassId = branchClassId; // Quiz Branch (Level 3)

        const newQuiz = await prisma.quiz.create({ data });

        res.status(201).json({ success: true, message: "Soal manual berhasil disimpan!", data: newQuiz });
    } catch (error) {
        console.error("Error Create Manual Quiz:", error);
        res.status(500).json({ success: false, message: "Gagal menyimpan soal manual." });
    }
};

export const getAllCoursesAdmin = async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                quizzes: true, // Quiz Ujian Akhir Path (Level 1)
                classes: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        quizzes: true, // Quiz Akhir Kelas (Kalau ada)
                        branchClasses: {
                            orderBy: { orderIndex: 'asc' },
                            include: {
                                quizzes: true, // Quiz per Branch
                                smallBranches: {
                                    orderBy: { orderIndex: 'asc' }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: courses });
    } catch (error) {
        console.error("Error Get Full Tree:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil data E-Learning." });
    }
};

export const getSmallBranchById = async (req, res) => {
    try {
        const { id } = req.params;
        const materi = await prisma.smallBranch.findUnique({ where: { id } });
        if (!materi) return res.status(404).json({ success: false, message: "Materi tidak ditemukan" });
        res.status(200).json({ success: true, data: materi });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal mengambil materi" });
    }
};

// ==========================================
// 9. UPDATE MATERI (Save hasil editan)
// ==========================================
export const updateSmallBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, orderIndex } = req.body;

        const updatedMateri = await prisma.smallBranch.update({
            where: { id },
            data: { title, content, orderIndex: Number(orderIndex) }
        });

        res.status(200).json({ success: true, message: "Materi berhasil diupdate!", data: updatedMateri });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal update materi" });
    }
};

// ==========================================
// UPDATE FUNCTIONS (Course, Class, BranchClass, Quiz) — FULL FIELD UPDATE
// ==========================================
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, type, price, isPublished, bannerUrl, originalPrice, category, level, promoVideoUrl, fullDescription, benefits, estimatedHours } = req.body;
        const data = {};
        if (title !== undefined) data.title = title;
        if (description !== undefined) data.description = description;
        if (type !== undefined) data.type = type;
        if (price !== undefined) data.price = Number(price);
        if (isPublished !== undefined) data.isPublished = isPublished;
        if (bannerUrl !== undefined) data.bannerUrl = bannerUrl;
        if (originalPrice !== undefined) data.originalPrice = originalPrice ? Number(originalPrice) : null;
        if (category !== undefined) data.category = category;
        if (level !== undefined) data.level = level;
        if (promoVideoUrl !== undefined) data.promoVideoUrl = promoVideoUrl;
        if (fullDescription !== undefined) data.fullDescription = fullDescription;
        if (benefits !== undefined) data.benefits = benefits;
        if (estimatedHours !== undefined) data.estimatedHours = Number(estimatedHours);

        const updated = await prisma.course.update({ where: { id }, data });
        res.status(200).json({ success: true, message: "Course berhasil diupdate!", data: updated });
    } catch (error) {
        console.error("Error Update Course:", error);
        res.status(500).json({ success: false, message: "Gagal update Course." });
    }
};

export const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, orderIndex, isPremium } = req.body;
        const data = {};
        if (title !== undefined) data.title = title;
        if (description !== undefined) data.description = description;
        if (orderIndex !== undefined) data.orderIndex = Number(orderIndex);
        if (isPremium !== undefined) data.isPremium = isPremium;
        const updated = await prisma.class.update({ where: { id }, data });
        res.status(200).json({ success: true, message: "Class berhasil diupdate!", data: updated });
    } catch (error) {
        console.error("Error Update Class:", error);
        res.status(500).json({ success: false, message: "Gagal update Class." });
    }
};

export const updateBranchClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, orderIndex } = req.body;
        const data = {};
        if (title !== undefined) data.title = title;
        if (orderIndex !== undefined) data.orderIndex = Number(orderIndex);
        const updated = await prisma.branchClass.update({ where: { id }, data });
        res.status(200).json({ success: true, message: "Branch Class berhasil diupdate!", data: updated });
    } catch (error) {
        console.error("Error Update Branch:", error);
        res.status(500).json({ success: false, message: "Gagal update Branch Class." });
    }
};

export const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, optionA, optionB, optionC, optionD, correctAnswer } = req.body;
        const data = {};
        if (question !== undefined) data.question = question;
        if (optionA !== undefined) data.optionA = optionA;
        if (optionB !== undefined) data.optionB = optionB;
        if (optionC !== undefined) data.optionC = optionC;
        if (optionD !== undefined) data.optionD = optionD;
        if (correctAnswer !== undefined) data.correctAnswer = correctAnswer;
        const updated = await prisma.quiz.update({ where: { id }, data });
        res.status(200).json({ success: true, message: "Quiz berhasil diupdate!", data: updated });
    } catch (error) {
        console.error("Error Update Quiz:", error);
        res.status(500).json({ success: false, message: "Gagal update Quiz." });
    }
};

// ==========================================
// DELETE FUNCTIONS (Course, Class, BranchClass, SmallBranch, Quiz)
// ==========================================
export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.course.delete({ where: { id } });
        res.status(200).json({ success: true, message: "Course berhasil dihapus!" });
    } catch (error) {
        console.error("Error Delete Course:", error);
        res.status(500).json({ success: false, message: "Gagal menghapus Course." });
    }
};

export const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.class.delete({ where: { id } });
        res.status(200).json({ success: true, message: "Class berhasil dihapus!" });
    } catch (error) {
        console.error("Error Delete Class:", error);
        res.status(500).json({ success: false, message: "Gagal menghapus Class." });
    }
};

export const deleteBranchClass = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.branchClass.delete({ where: { id } });
        res.status(200).json({ success: true, message: "Branch Class berhasil dihapus!" });
    } catch (error) {
        console.error("Error Delete Branch:", error);
        res.status(500).json({ success: false, message: "Gagal menghapus Branch Class." });
    }
};

export const deleteSmallBranch = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.smallBranch.delete({ where: { id } });
        res.status(200).json({ success: true, message: "Materi berhasil dihapus!" });
    } catch (error) {
        console.error("Error Delete SmallBranch:", error);
        res.status(500).json({ success: false, message: "Gagal menghapus materi." });
    }
};

export const deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.quiz.delete({ where: { id } });
        res.status(200).json({ success: true, message: "Quiz berhasil dihapus!" });
    } catch (error) {
        console.error("Error Delete Quiz:", error);
        res.status(500).json({ success: false, message: "Gagal menghapus Quiz." });
    }
};

// ==========================================
// GET COURSE WORKSPACE BY ID (Nested include sampai SmallBranch + Quiz)
// ==========================================
export const getCourseWorkspaceById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                quizzes: true, // Quiz Ujian Akhir Path (Level 1)
                classes: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        quizzes: true, // Quiz Evaluasi Bab (Level 2)
                        branchClasses: {
                            orderBy: { orderIndex: 'asc' },
                            include: {
                                quizzes: true, // Quiz per Branch (Level 3 - legacy)
                                smallBranches: {
                                    orderBy: { orderIndex: 'asc' }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!course) return res.status(404).json({ success: false, message: "Course tidak ditemukan." });
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error("Error Get Course Workspace:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil data workspace." });
    }
};

// ==========================================
// GENERATE CLASS QUIZ AI (Quiz Evaluasi Bab - Level 2)
// ==========================================
export const generateClassQuizAI = async (req, res) => {
    try {
        const { classId } = req.body;
        if (!classId) return res.status(400).json({ success: false, message: "classId kosong!" });

        // Ambil semua SmallBranch dari semua BranchClass di Class ini
        const branches = await prisma.branchClass.findMany({
            where: { classId },
            include: {
                smallBranches: { orderBy: { orderIndex: 'asc' } }
            },
            orderBy: { orderIndex: 'asc' }
        });

        const allSmallBranches = branches.flatMap(b => b.smallBranches);
        if (allSmallBranches.length === 0) {
            return res.status(404).json({ success: false, message: "Belum ada materi di kelas ini untuk dibaca AI!" });
        }

        let fullContent = allSmallBranches.map(sb => sb.content).join("\n\n");
        // Batasi maksimal 12.000 karakter untuk menghindari error 413
        if (fullContent.length > 12000) {
            fullContent = fullContent.substring(0, 12000);
        }

        const systemPrompt = `Kamu adalah pembuat soal e-learning profesional. 
        Tugasmu: Buat 5 soal pilihan ganda berdasarkan teks materi yang diberikan.
        Ini adalah soal EVALUASI BAB (mencakup seluruh materi dalam satu kelas/bab).
        SYARAT MUTLAK: Jawabanmu HARUS berupa array JSON murni. Jangan tambahkan teks intro/penutup. Jangan gunakan markdown \`\`\`json.
        Format JSON yang wajib diikuti:
        [
          {
            "question": "Pertanyaan disini?",
            "optionA": "Pilihan A",
            "optionB": "Pilihan B",
            "optionC": "Pilihan C",
            "optionD": "Pilihan D",
            "correctAnswer": "A"
          }
        ]`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Buatkan 5 soal evaluasi bab dari materi gabungan ini:\n\n${fullContent}` }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
        });

        let aiResponse = chatCompletion.choices[0]?.message?.content || "[]";
        aiResponse = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const quizzesJSON = JSON.parse(aiResponse);

        const savedQuizzes = await Promise.all(
            quizzesJSON.map(async (q) => {
                return await prisma.quiz.create({
                    data: {
                        classId: classId, // Nempel ke Class (Level 2)
                        question: q.question,
                        optionA: q.optionA,
                        optionB: q.optionB,
                        optionC: q.optionC,
                        optionD: q.optionD,
                        correctAnswer: q.correctAnswer
                    }
                });
            })
        );

        res.status(201).json({ success: true, message: "5 Soal Evaluasi Bab AI berhasil dibuat!", data: savedQuizzes });
    } catch (error) {
        console.error("Error Generate Class Quiz AI:", error);
        res.status(500).json({ success: false, message: "Gagal memproses AI Quiz Bab." });
    }
};

// ==========================================
// GENERATE COURSE QUIZ AI (Ujian Akhir Path - Level 1)
// ==========================================
export const generateCourseQuizAI = async (req, res) => {
    try {
        const { courseId } = req.body;
        if (!courseId) return res.status(400).json({ success: false, message: "courseId kosong!" });

        // Ambil SEMUA SmallBranch di seluruh Course
        const classes = await prisma.class.findMany({
            where: { courseId },
            include: {
                branchClasses: {
                    include: {
                        smallBranches: { orderBy: { orderIndex: 'asc' } }
                    },
                    orderBy: { orderIndex: 'asc' }
                }
            },
            orderBy: { orderIndex: 'asc' }
        });

        const allSmallBranches = classes.flatMap(c => c.branchClasses.flatMap(b => b.smallBranches));
        if (allSmallBranches.length === 0) {
            return res.status(404).json({ success: false, message: "Belum ada materi di seluruh Course untuk dibaca AI!" });
        }

        let fullContent = allSmallBranches.map(sb => sb.content).join("\n\n");
        // Batasi maksimal 12.000 karakter untuk menghindari error 413
        if (fullContent.length > 12000) {
            fullContent = fullContent.substring(0, 12000);
        }

        const systemPrompt = `Kamu adalah pembuat soal e-learning profesional. 
        Tugasmu: Buat 5 soal pilihan ganda berdasarkan teks materi yang diberikan.
        Ini adalah soal UJIAN AKHIR (mencakup seluruh materi dalam satu path/tema besar).
        Soal harus lebih komprehensif dan menguji pemahaman lintas bab.
        SYARAT MUTLAK: Jawabanmu HARUS berupa array JSON murni. Jangan tambahkan teks intro/penutup. Jangan gunakan markdown \`\`\`json.
        Format JSON yang wajib diikuti:
        [
          {
            "question": "Pertanyaan disini?",
            "optionA": "Pilihan A",
            "optionB": "Pilihan B",
            "optionC": "Pilihan C",
            "optionD": "Pilihan D",
            "correctAnswer": "A"
          }
        ]`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Buatkan 5 soal ujian akhir dari seluruh materi berikut:\n\n${fullContent}` }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
        });

        let aiResponse = chatCompletion.choices[0]?.message?.content || "[]";
        aiResponse = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const quizzesJSON = JSON.parse(aiResponse);

        const savedQuizzes = await Promise.all(
            quizzesJSON.map(async (q) => {
                return await prisma.quiz.create({
                    data: {
                        courseId: courseId, // Nempel ke Course (Level 1)
                        question: q.question,
                        optionA: q.optionA,
                        optionB: q.optionB,
                        optionC: q.optionC,
                        optionD: q.optionD,
                        correctAnswer: q.correctAnswer
                    }
                });
            })
        );

        res.status(201).json({ success: true, message: "5 Soal Ujian Akhir AI berhasil dibuat!", data: savedQuizzes });
    } catch (error) {
        console.error("Error Generate Course Quiz AI:", error);
        res.status(500).json({ success: false, message: "Gagal memproses AI Quiz Ujian Akhir." });
    }
};

export const getPublishedCourses = async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            where: { isPublished: true }, // CUMA NARIK YANG UDAH DI-PUBLISH
            include: {
                _count: {
                    select: {
                        classes: true, // Ngitung jumlah kelas
                        enrollments: true // Ngitung jumlah murid (opsional buat pamer)
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: courses });
    } catch (error) {
        console.error("Error Get Published Courses:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil katalog E-Learning." });
    }
};

export const getCourseDetailPublic = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await prisma.course.findUnique({
            where: { id, isPublished: true },
            include: {
                classes: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        branchClasses: {
                            orderBy: { orderIndex: 'asc' },
                            include: {
                                _count: { select: { smallBranches: true } } // Cuma ngitung jumlah materi, teks aslinya dirahasiakan!
                            }
                        }
                    }
                }
            }
        });

        if (!course) return res.status(404).json({ success: false, message: "Kelas tidak ditemukan atau belum di-publish." });
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        console.error("Error Get Public Course Detail:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil detail kelas." });
    }
};