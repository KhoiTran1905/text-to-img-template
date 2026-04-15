'use client';

import { useState, useEffect } from 'react';
import { getFeedbacks, deleteFeedback, updateFeedback } from '../actions';
import styles from '../page.module.css';

export default function ThacmacDaGui() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            fetchFeedbacks();
        }
    }, [isAuthenticated]);

    const fetchFeedbacks = async () => {
        setIsLoading(true);
        const result = await getFeedbacks();
        if (result.success) {
            setFeedbacks(result.data || []);
        }
        setIsLoading(false);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAuthenticated(true);
        } else {
            alert('Sai mật khẩu!');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa?')) return;
        const result = await deleteFeedback(id);
        if (result.success) {
            setFeedbacks(feedbacks.filter(f => f.id !== id));
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'pending' ? 'replied' : 'pending';
        const result = await updateFeedback(id, { status: newStatus });
        if (result.success) {
            setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: newStatus } : f));
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <form onSubmit={handleLogin} className={styles.adminLoginForm}>
                    <h3>Xác thực Quản trị</h3>
                    <input
                        type="password"
                        placeholder="Nhập mật khẩu..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.adminInput}
                    />
                    <button type="submit" className={styles.adminButton}>Đăng nhập</button>
                </form>
            </div>
        );
    }

    return (
        <div className={styles.adminContainer}>
            <div className={styles.adminHeader}>
                <h2>Danh sách Điều em muốn nói</h2>
                <button onClick={fetchFeedbacks} className={styles.refreshButton}>Làm mới</button>
            </div>

            {isLoading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.adminTable}>
                        <thead>
                            <tr>
                                <th>Người gửi</th>
                                <th>Tiêu đề</th>
                                <th>Nội dung</th>
                                <th>Ngày gửi</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Chưa có phản hồi nào.</td>
                                </tr>
                            ) : (
                                feedbacks.map((f) => (
                                    <tr key={f.id} className={f.status === 'replied' ? styles.rowReplied : ''}>
                                        <td className={styles.colName}>{f.name}</td>
                                        <td className={styles.colTitle}>{f.title}</td>
                                        <td className={styles.colContent}>
                                            <div className={styles.contentScroll}>{f.content}</div>
                                        </td>
                                        <td className={styles.colDate}>
                                            {new Date(f.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleToggleStatus(f.id, f.status)}
                                                className={f.status === 'replied' ? styles.statusBadgeReplied : styles.statusBadgePending}
                                            >
                                                {f.status === 'replied' ? 'Đã phản hồi' : 'Chờ duyệt'}
                                            </button>
                                        </td>
                                        <td className={styles.colActions}>
                                            <button onClick={() => handleDelete(f.id)} className={styles.iconDeleteButton} title="Xóa">
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
