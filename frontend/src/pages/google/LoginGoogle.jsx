import React, { useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import axios from 'axios';

const LoginGoogle = () => {
    useEffect(() => {
        // Ngecek kalau user udah beres login dan balik ke web lu
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const user = session.user;
                console.log("Mantap! Dapet data dari Google:", user);

                // Kirim datanya ke backend Node.js + Prisma lu
                simpanKeDatabaseKita(user);
            }
        };
        checkUser();
    }, []);

    const simpanKeDatabaseKita = async (googleUser) => {
        try {
            // Tembak API lu buat nyimpen/nyari user berdasarkan email
            const response = await axios.post('http://localhost:5000/api/auth/google', {
                email: googleUser.email,
                nama: googleUser.user_metadata.full_name,
                googleId: googleUser.id // Opsional, simpan ID Supabase-nya
            });

            // Simpan token buatan backend lu ke localStorage
            localStorage.setItem('token', response.data.token);
            alert("Login Berhasil Bro!");
            window.location.href = '/dashboard'; // Arahin ke halaman pesanan
        } catch (error) {
            console.error("Gagal nyimpen ke DB:", error);
        }
    };

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) console.log("Waduh error login:", error.message);
    };

    return (
        <button
            onClick={handleLogin}
            className="bg-white text-gray-800 font-bold py-2 px-4 rounded shadow hover:bg-gray-100 flex items-center"
        >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
            Lanjut pakai Google
        </button>
    );
};

export default LoginGoogle;