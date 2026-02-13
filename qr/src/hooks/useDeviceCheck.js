import { useState, useEffect } from 'react';

export default function useDeviceCheck() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        };
        checkDevice();
    }, []);

    return isMobile;
}
