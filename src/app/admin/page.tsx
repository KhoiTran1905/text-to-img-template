'use client';

import { useState, useEffect, useRef } from 'react';
import { getLayoutConfig, saveLayoutConfig } from '../actions';
import styles from '../page.module.css';

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [config, setConfig] = useState<any>(null);
    const [draggingItem, setDraggingItem] = useState<string | null>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [imgDimensions, setImgDimensions] = useState({ width: 1200, height: 675 });

    useEffect(() => {
        // Initial fetch
        if (isAuthenticated) {
            getLayoutConfig().then(setConfig);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const updateDimensions = () => {
            if (imgRef.current && imgRef.current.naturalWidth > 0) {
                setImgDimensions({
                    width: imgRef.current.naturalWidth,
                    height: imgRef.current.naturalHeight
                });
            }
        };

        const img = imgRef.current;
        if (img) {
            img.addEventListener('load', updateDimensions);
            if (img.complete) {
                updateDimensions();
            }
        }

        return () => {
            if (img) {
                img.removeEventListener('load', updateDimensions);
            }
        };
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin123') {
            setIsAuthenticated(true);
        } else {
            alert('Wrong password');
        }
    };

    const handleDragStart = (e: React.MouseEvent, item: string) => {
        e.preventDefault();
        setDraggingItem(item);
        // Calculate offset from the top-left of the item relative to mouse
        // But simplified: we just track movement deltas or absolute positions derived from mouse
        // Better strategy:
        // 1. Get current mouse pos
        // 2. Get current item pos (from config)
        // 3. Store offset = mousePos - itemPos
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const itemX = config[item].x;
        const itemY = config[item].y;
        setOffset({ x: mouseX - itemX, y: mouseY - itemY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingItem || !cardRef.current) return;

        const cardRect = cardRef.current.getBoundingClientRect();

        // Calculate new position relative to card top-left
        // MousePageX - CardPageX - Offset
        const newX = e.clientX - offset.x; // This logic needs to be relative to card

        // Actually, config.x is "pixels from left of card".
        // So: MouseClientX - CardClientX - (OffsetMouseToItemOrigin) 
        // Wait, let's redefine offset. 
        // On Start: Offset = MouseClientX - (CardClientX + ItemX)
        // No, on start: 
        // 1. We know MouseClientX.
        // 2. We know CardClientX.
        // 3. We know ItemX (relative).
        // MouseClientX = CardClientX + ItemX + ClickOffsetX
        // We want to preserve ClickOffsetX.

        // Let's do:
        // deltaX = currentMouseX - startMouseX
        // newX = startItemX + deltaX
        // Use a Ref for start positions to avoid stale closures if needed, but state is okay for simple.

        // Simpler relative approach:
        // X = e.clientX - cardRect.left - (offset.x)
        // Where offset.x = (startMouseX - (cardRect.left + startItemX)) ... aka click offset inside element
        // Let's rely on the setOffset we calculated earlier: 
        // earlier: offset.x = mouseX - itemX. (Absolute mouse X minus Relative item X? No that's wrong units mixing)

        // Correct logic:
        // start:
        //   itemRect = ...
        //   clickOffsetX = e.clientX - itemRect.left
        //   clickOffsetY = e.clientY - itemRect.top
        // move:
        //   newLeft = e.clientX - cardRect.left - clickOffsetX
        //   newTop = e.clientY - cardRect.top - clickOffsetY

        // BUT, we only have config X/Y which are relative to card.

        // Let's recalculate offset on start correctly:
        const startX = e.clientX - (cardRect.left + config[draggingItem].x);
        const startY = e.clientY - (cardRect.top + config[draggingItem].y);

        // Wait, the state `offset` I set in DragStart was `mouseX - config.x`. That assumes card is at 0,0. 
        // Correct implementation details in handleDragStart:
    };

    // Percentage-based drag logic
    const onDragStart = (e: React.MouseEvent, item: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!cardRef.current || !imgRef.current) return;

        const cardRect = cardRef.current.getBoundingClientRect();
        const imgWidth = imgRef.current.clientWidth;
        const imgHeight = imgRef.current.clientHeight;

        // Mouse position as percentage of image
        const mouseXPercent = ((e.clientX - cardRect.left) / imgWidth) * 100;
        const mouseYPercent = ((e.clientY - cardRect.top) / imgHeight) * 100;

        // Calculate offset from element position
        const elemXPercent = (config[item].x / imgDimensions.width) * 100;
        const elemYPercent = (config[item].y / imgDimensions.height) * 100;

        setDraggingItem(item);
        setOffset({
            x: mouseXPercent - elemXPercent,
            y: mouseYPercent - elemYPercent
        });
    }

    const [resizingItem, setResizingItem] = useState<string | null>(null);

    const onMouseDownResize = (e: React.MouseEvent, item: string) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingItem(item);

        if (!cardRef.current || !imgRef.current) return;
        const cardRect = cardRef.current.getBoundingClientRect();
        const imgWidth = imgRef.current.clientWidth;
        const imgHeight = imgRef.current.clientHeight;

        const mouseXPercent = ((e.clientX - cardRect.left) / imgWidth) * 100;
        const mouseYPercent = ((e.clientY - cardRect.top) / imgHeight) * 100;

        setOffset({ x: mouseXPercent, y: mouseYPercent });
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current || !config || !imgRef.current) return;

        const cardRect = cardRef.current.getBoundingClientRect();
        const imgWidth = imgRef.current.clientWidth;
        const imgHeight = imgRef.current.clientHeight;

        const mouseXPercent = ((e.clientX - cardRect.left) / imgWidth) * 100;
        const mouseYPercent = ((e.clientY - cardRect.top) / imgHeight) * 100;

        if (draggingItem) {
            const newXPercent = mouseXPercent - offset.x;
            const newYPercent = mouseYPercent - offset.y;

            // Convert back to pixels based on reference dimensions
            const newX = (newXPercent / 100) * imgDimensions.width;
            const newY = (newYPercent / 100) * imgDimensions.height;

            setConfig({
                ...config,
                [draggingItem]: {
                    ...config[draggingItem],
                    x: Math.round(newX),
                    y: Math.round(newY)
                }
            });
        }

        if (resizingItem) {
            const deltaXPercent = mouseXPercent - offset.x;
            const deltaYPercent = mouseYPercent - offset.y;

            const deltaX = (deltaXPercent / 100) * imgDimensions.width;
            const deltaY = (deltaYPercent / 100) * imgDimensions.height;

            const currentWidth = config[resizingItem].width;
            const currentHeight = config[resizingItem].height;

            setConfig({
                ...config,
                [resizingItem]: {
                    ...config[resizingItem],
                    width: Math.max(20, Math.round(currentWidth + deltaX)),
                    height: Math.max(20, Math.round(currentHeight + deltaY))
                }
            });

            setOffset({ x: mouseXPercent, y: mouseYPercent });
        }
    }

    const onMouseUp = () => {
        setDraggingItem(null);
        setResizingItem(null);
    };

    const handleSave = async () => {
        const configToSave = {
            ...config,
            dimensions: imgDimensions
        };
        const result = await saveLayoutConfig(configToSave);
        if (result.success) {
            alert('Configuration saved!');
        } else {
            alert('Failed to save');
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                <form onSubmit={handleLogin} style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="password"
                        placeholder="Enter Admin Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ padding: '0.5rem' }}
                    />
                    <button type="submit" style={{ padding: '0.5rem 1rem' }}>Login</button>
                </form>
            </div>
        );
    }

    if (!config) return <div>Loading...</div>;

    return (
        <div
            className={styles.container}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
        >
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '1rem', background: '#333', color: 'white', zIndex: 1000, display: 'flex', justifyContent: 'space-between' }}>
                <h3>Admin Layout Editor</h3>
                <div>
                    <span style={{ marginRight: '2rem', fontSize: '0.9rem' }}>Drag elements to reposition.</span>
                    <button onClick={handleSave} style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold' }}>SAVE LAYOUT</button>
                </div>
            </div>

            <div
                className={styles.rightPanel}
                style={{
                    marginTop: '50px',
                    width: '100%',     // Full width for admin
                    height: 'calc(100vh - 50px)',
                    backgroundColor: '#333', // Dark background for contrast
                    overflowY: 'auto'
                }}
            >
                <div style={{ display: 'flex', height: '100%' }}>
                    {/* Left Column: Tools */}
                    <div style={{ width: '50%', padding: '2rem', borderRight: '1px solid #444', color: 'white', overflowY: 'auto' }}>
                        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #555', paddingBottom: '0.5rem' }}>Tools</h2>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Replace Background:</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const formData = new FormData();
                                    formData.append('file', file);

                                    const result = await import('../actions').then(mod => mod.uploadBackgroundImage(formData));
                                    if (result.success) {
                                        alert("Background updated! Refreshing...");
                                        window.location.reload();
                                    } else {
                                        alert("Failed to upload");
                                    }
                                }}
                                style={{ width: '100%' }}
                            />
                            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#aaa' }}>
                                Uploading a new image will update the layout dimensions.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div style={{ width: '50%', height: '100%', overflow: 'auto', position: 'relative' }}>
                        <div className={styles.previewWrapper}>
                            <div
                                className={styles.card}
                                ref={cardRef}
                                style={{ position: 'relative' }}
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
                                        className={styles.contentBox}
                                        style={{
                                            left: `${(config.content.x / imgDimensions.width) * 100}%`,
                                            top: `${(config.content.y / imgDimensions.height) * 100}%`,
                                            width: `${(config.content.width / imgDimensions.width) * 100}%`,
                                            height: `${(config.content.height / imgDimensions.height) * 100}%`,
                                            cursor: 'move',
                                            border: draggingItem === 'content' ? '2px dashed blue' : '1px solid #333',
                                            right: 'auto', bottom: 'auto'
                                        }}
                                        onMouseDown={(e) => onDragStart(e, 'content')}
                                    >
                                        <div className={styles.contentTitle}>Content Area (Drag Me)</div>
                                        <div className={styles.expectation}>
                                            [Generic Content Placeholder]
                                        </div>
                                        <div
                                            style={{
                                                position: 'absolute', right: 0, bottom: 0, width: '15px', height: '15px',
                                                background: 'blue', cursor: 'se-resize', zIndex: 100
                                            }}
                                            onMouseDown={(e) => onMouseDownResize(e, 'content')}
                                        />
                                    </div>

                                    {/* Avatar */}
                                    <div
                                        className={styles.avatarContainer}
                                        style={{
                                            left: `${(config.avatar.x / imgDimensions.width) * 100}%`,
                                            top: `${(config.avatar.y / imgDimensions.height) * 100}%`,
                                            width: `${(config.avatar.width / imgDimensions.width) * 100}%`,
                                            height: `${(config.avatar.height / imgDimensions.height) * 100}%`,
                                            cursor: 'move',
                                            border: draggingItem === 'avatar' ? '2px dashed blue' : '1px solid transparent'
                                        }}
                                        onMouseDown={(e) => onDragStart(e, 'avatar')}
                                    >
                                        <div className={`${styles.avatar} ${styles.placeholderAvatar}`}>AVATAR (Drag Me)</div>
                                        <div
                                            style={{
                                                position: 'absolute', right: 0, bottom: 0, width: '15px', height: '15px',
                                                background: 'blue', cursor: 'se-resize', zIndex: 100
                                            }}
                                            onMouseDown={(e) => onMouseDownResize(e, 'avatar')}
                                        />
                                    </div>

                                    {/* Name */}
                                    <div
                                        className={styles.name}
                                        style={{
                                            position: 'absolute',
                                            left: `${(config.name.x / imgDimensions.width) * 100}%`,
                                            top: `${(config.name.y / imgDimensions.height) * 100}%`,
                                            transform: 'translateX(-50%)',
                                            zIndex: 30,
                                            cursor: 'move',
                                            border: draggingItem === 'name' ? '1px dashed blue' : 'none',
                                            background: 'rgba(255,255,255,0.2)'
                                        }}
                                        onMouseDown={(e) => onDragStart(e, 'name')}
                                    >
                                        FULL NAME
                                    </div>

                                    {/* Position */}
                                    <div
                                        className={styles.position}
                                        style={{
                                            position: 'absolute',
                                            left: `${(config.position.x / imgDimensions.width) * 100}%`,
                                            top: `${(config.position.y / imgDimensions.height) * 100}%`,
                                            transform: 'translateX(-50%)',
                                            zIndex: 30,
                                            cursor: 'move',
                                            border: draggingItem === 'position' ? '1px dashed blue' : 'none',
                                            background: 'rgba(255,255,255,0.2)'
                                        }}
                                        onMouseDown={(e) => onDragStart(e, 'position')}
                                    >
                                        Your Position
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
