import React from 'react'
import { Link, useNavigate } from 'react-router'

const NotFound = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in">
            <div className="text-center max-w-md mx-auto">
                {/* 404 glowing number */}
                <div className="text-[8rem] font-black leading-none text-gradient-primary mb-4 select-none">
                    404
                </div>

                <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
                <p className="text-stone-400 mb-10 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-300 active:scale-95" style={{ background: "linear-gradient(135deg,#ff6662,#fe9a00)" }}>
                        🏠 Go Home
                    </Link>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 rounded-xl font-semibold text-sm text-stone-300 hover:text-white transition-all duration-200"
                        style={{background:'rgba(30,41,59,0.6)', border:'1px solid rgba(51,65,85,0.6)'}}>
                        ← Go Back
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NotFound
