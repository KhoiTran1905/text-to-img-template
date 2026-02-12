'use client';

import { useState, useEffect } from 'react';
import { getLogs } from '../actions';
import styles from '../page.module.css';

export default function LogPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [logs, setLogs] = useState<any>(null);

    useEffect(() => {
        if (isAuthenticated) {
            getLogs().then(setLogs);
        }
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') { // Using same password as admin for consistency
            setIsAuthenticated(true);
        } else {
            alert('Sai mật khẩu');
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
                <form onSubmit={handleLogin} style={{
                    background: 'white',
                    padding: '2.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.2rem',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#111' }}>Xác thực Admin</h2>
                    <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>Vui lòng nhập mật khẩu để xem lịch sử tải xuống.</p>
                    <input
                        type="password"
                        placeholder="Mật khẩu truy cập"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '1rem'
                        }}
                    />
                    <button type="submit" style={{
                        padding: '0.8rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#0070f3',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}>Đăng nhập</button>
                </form>
            </div>
        );
    }

    if (!logs) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: '#111', fontWeight: '800' }}>Lịch sử Tải xuống</h1>
                <div style={{ background: '#0070f3', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '50px', fontWeight: 'bold' }}>
                    Tổng cộng: {logs.total}
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #eee' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: '600', color: '#666' }}>Họ và Tên</th>
                            <th style={{ padding: '1.2rem', textAlign: 'right', fontWeight: '600', color: '#666' }}>Thời gian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.entries.length === 0 ? (
                            <tr>
                                <td colSpan={2} style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>Chưa có lượt tải xuống nào.</td>
                            </tr>
                        ) : (
                            logs.entries.slice().reverse().map((entry: any, index: number) => (
                                <tr key={index} style={{ borderBottom: index === logs.entries.length - 1 ? 'none' : '1px solid #f0f0f0', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1.2rem', color: '#333', fontWeight: '500' }}>{entry.name}</td>
                                    <td style={{ padding: '1.2rem', textAlign: 'right', color: '#666', fontSize: '0.9rem' }}>
                                        {new Date(entry.timestamp).toLocaleString('vi-VN')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
