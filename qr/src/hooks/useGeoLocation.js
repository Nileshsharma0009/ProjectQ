import { useState, useEffect } from 'react';

export default function useGeoLocation() {
    const [location, setLocation] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => setLocation(position.coords),
            (error) => console.error(error)
        );
    }, []);

    return location;
}
