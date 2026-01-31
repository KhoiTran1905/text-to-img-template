'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import html2canvas from 'html2canvas';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';

type LayoutConfig = {
    dimensions?: { width: number; height: number };
    avatar: { x: number; y: number; width: number; height: number };
    name: { x: number; y: number };
    position: { x: number; y: number };
    content: { x: number; y: number; width: number; height: number }; // Changed to object with coords
};

// Helper to convert pixel coordinates to percentages
function toPercent(value: number, reference: number): number {
    return (value / reference) * 100;
}

export default function HomeClient({ config }: { config: LayoutConfig }) {
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [expectation, setExpectation] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const contentBoxRef = useRef<HTMLDivElement>(null);
    const contentTextRef = useRef<HTMLDivElement>(null);
    const [contentFontSize, setContentFontSize] = useState<number | null>(null);

    // Cropping State
    const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    // Reference dimensions from config (or defaults)
    const refWidth = config.dimensions?.width || 1200;
    const refHeight = config.dimensions?.height || 675;

    // Auto-scale content text to fit container
    useEffect(() => {
        const adjustContentFontSize = () => {
            if (!contentBoxRef.current || !contentTextRef.current) return;

            const container = contentBoxRef.current;
            const textElement = contentTextRef.current;

            // Reset to default first
            textElement.style.fontSize = '';

            // Get computed styles
            const containerHeight = container.clientHeight;
            const containerWidth = container.clientWidth;

            // Check if content overflows
            let fontSize = parseFloat(window.getComputedStyle(textElement).fontSize);
            const minFontSize = 8; // Minimum readable font size

            // Reduce font size until it fits or reaches minimum
            while ((textElement.scrollHeight > containerHeight || textElement.scrollWidth > containerWidth) && fontSize > minFontSize) {
                fontSize -= 0.5;
                textElement.style.fontSize = `${fontSize}px`;
            }

            setContentFontSize(fontSize);
        };

        // Run on mount and when expectation changes
        adjustContentFontSize();

        // Also run on window resize
        window.addEventListener('resize', adjustContentFontSize);

        return () => {
            window.removeEventListener('resize', adjustContentFontSize);
        };
    }, [expectation]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setTempImageSrc(event.target?.result as string);
                setIsCropping(true);
                setZoom(1);
                setCrop({ x: 0, y: 0 });
            };
            reader.readAsDataURL(file);
        }
        // Reset input value to allow re-selecting the same file if needed
        e.target.value = '';
    };

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSaveCrop = async () => {
        if (tempImageSrc && croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(tempImageSrc, croppedAreaPixels);
                setAvatar(croppedImage);
                setIsCropping(false);
                setTempImageSrc(null);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleCancelCrop = () => {
        setIsCropping(false);
        setTempImageSrc(null);
    };

    const handleDownload = async () => {
        if (cardRef.current) {
            try {
                const canvas = await html2canvas(cardRef.current, {
                    scale: 4, // Increased scale for better quality
                    useCORS: true,
                    backgroundColor: null,
                    logging: false,
                });

                const link = document.createElement('a');
                const fileName = name ? `card-${name.trim().replace(/\s+/g, '-').toLowerCase()}` : 'my-card';
                link.download = `${fileName}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.error("Failed to generate image", err);
                alert("Could not generate image. Please try again.");
            }
        }
    };

    return (
        <div className={styles.container}>
            {/* Left Side: Form */}
            <div className={styles.leftPanel}>
                <div className={styles.form}>
                    <h2 style={{ marginBottom: '0.5rem', color: '#111' }}>Tạo Thẻ Giới Thiệu</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Nhập thông tin bên dưới để tạo thẻ của riêng bạn.
                    </p>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Chọn hình ảnh (Vuông)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Họ và tên</label>
                        <input
                            type="text"
                            placeholder="Ví dụ: Nguyễn Văn A"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Chức vụ</label>
                        <input
                            type="text"
                            placeholder="Ví dụ: Giám đốc kinh doanh"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Kỳ vọng của bạn</label>
                        <textarea
                            placeholder="Chia sẻ ngắn gọn về kỳ vọng hoặc mục tiêu của bạn..."
                            value={expectation}
                            onChange={(e) => setExpectation(e.target.value)}
                            className={styles.textarea}
                            maxLength={300}
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#999' }}>
                            {expectation.length}/300
                        </div>
                    </div>

                    <button onClick={handleDownload} className={styles.button}>
                        Tải xuống ảnh
                    </button>
                </div>
            </div>

            {/* Right Side: Preview */}
            <div className={styles.rightPanel}>
                <div className={styles.previewWrapper}>
                    {/* The actual card to be captured */}
                    <div
                        className={styles.card}
                        ref={cardRef}
                    // style={{ position: 'relative' }} // Moved class to css check if works
                    >
                        <img
                            ref={imgRef}
                            src="/background_landscape.png"
                            alt="Card background"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                        <div
                            className={styles.cardContent}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%'
                            }}
                        >
                            {/* Content Box */}
                            <div
                                ref={contentBoxRef}
                                className={styles.contentBox}
                                style={{
                                    left: `${toPercent(config.content.x, refWidth)}%`,
                                    top: `${toPercent(config.content.y, refHeight)}%`,
                                    width: `${toPercent(config.content.width, refWidth)}%`,
                                    height: `${toPercent(config.content.height, refHeight)}%`,
                                    right: 'auto', bottom: 'auto'
                                }}
                            >
                                <div
                                    ref={contentTextRef}
                                    className={styles.expectation}
                                >
                                    {expectation || "Nội dung kỳ vọng của bạn sẽ hiển thị ở đây. Hãy nhập thông tin để xem trước kết quả."}
                                </div>
                            </div>

                            {/* Avatar */}
                            <div
                                className={styles.avatarContainer}
                                style={{
                                    left: `${toPercent(config.avatar.x, refWidth)}%`,
                                    top: `${toPercent(config.avatar.y, refHeight)}%`,
                                    width: `${toPercent(config.avatar.width, refWidth)}%`,
                                    height: `${toPercent(config.avatar.height, refHeight)}%`
                                }}
                            >
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt="Avatar"
                                        className={styles.avatar}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '50%',
                                            display: 'block'
                                        }}
                                    />
                                ) : (
                                    <div className={`${styles.avatar} ${styles.placeholderAvatar}`}>AVATAR</div>
                                )}
                            </div>

                            {/* Name */}
                            <div
                                className={styles.name}
                                style={{
                                    position: 'absolute',
                                    left: `${toPercent(config.name.x, refWidth)}%`,
                                    top: `${toPercent(config.name.y, refHeight)}%`,
                                    transform: 'translateX(-50%)',
                                    zIndex: 30
                                }}
                            >
                                {name || "FULL NAME"}
                            </div>

                            {/* Position */}
                            <div
                                className={styles.position}
                                style={{
                                    position: 'absolute',
                                    left: `${toPercent(config.position.x, refWidth)}%`,
                                    top: `${toPercent(config.position.y, refHeight)}%`,
                                    transform: 'translateX(-50%)',
                                    zIndex: 30
                                }}
                            >
                                {position || "Position"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Crop Modal */}
            {isCropping && tempImageSrc && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalTitle}>Chỉnh sửa ảnh</div>
                        <div className={styles.cropContainer}>
                            <Cropper
                                image={tempImageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1} // Avatar is typically square
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                        <div className={styles.controls}>
                            <div className={styles.sliderContainer}>
                                <span className={styles.sliderLabel}>Zoom</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className={styles.zoomRange}
                                />
                            </div>
                            <div className={styles.buttonGroup}>
                                <button
                                    onClick={handleCancelCrop}
                                    className={styles.cancelButton}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleSaveCrop}
                                    className={styles.saveButton}
                                >
                                    Lưu ảnh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple Scaler Component
function Scaler({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    // Initial width of the card
    const CARD_WIDTH = 800; // Must match CSS

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const parentWidth = containerRef.current.parentElement?.clientWidth || 800;
                // Add some padding/margin safety
                const availableWidth = parentWidth - 40;
                const newScale = Math.min(1, availableWidth / CARD_WIDTH);
                setScale(newScale);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call

        // Small delay to ensure layout is ready
        setTimeout(handleResize, 100);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div
            ref={containerRef}
            className={styles.scalerContainer}
            style={{
                // We keep the container strictly sized to the scaled content to prevent overflow
                width: CARD_WIDTH * scale,
                height: 500 * scale, // 500 is card height
                position: 'relative'
            }}
        >
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                // The content inside is absolute 800x500
                width: CARD_WIDTH,
                height: 500,
            }}>
                {children}
            </div>
        </div>
    );
}
