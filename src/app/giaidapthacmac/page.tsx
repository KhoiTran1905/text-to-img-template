'use client';

import { useState } from 'react';
import { submitFeedback } from '../actions';
import styles from '../page.module.css';

export default function GiaidapThacmac() {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        content: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Name is now optional, only Title and Content are required
        if (!formData.title || !formData.content) {
            alert('Vui lòng điền tiêu đề và nội dung!');
            return;
        }

        setIsSubmitting(true);
        const result = await submitFeedback(formData);
        setIsSubmitting(false);

        if (result.success) {
            setMessage({ type: 'success', text: 'Gửi thành công! Cảm ơn ý kiến của bạn.' });
            setFormData({ name: '', title: '', content: '' });
        } else {
            setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại sau.' });
        }
    };

    return (
        <div className={styles.feedbackContainer}>
            <div className={styles.feedbackOverlay}>
                <div className={styles.feedbackCard}>
                    <h2 className={styles.feedbackHeader}>Hộp thư số - Điều em muốn nói</h2>
                    
                    {message && (
                        <div className={message.type === 'success' ? styles.successAlert : styles.errorAlert}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.feedbackForm}>
                        <div className={styles.feedbackGroup}>
                            <label>Họ và tên (Không bắt buộc)</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nhập họ và tên của bạn..."
                            />
                        </div>

                        <div className={styles.feedbackGroup}>
                            <label>Tiêu đề</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Tiêu đề thắc mắc..."
                            />
                        </div>

                        <div className={styles.feedbackGroup}>
                            <label>Nội dung</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Nội dung chi tiết..."
                                rows={5}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={styles.feedbackButton}
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Gửi đi'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
