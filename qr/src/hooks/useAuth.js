import { useState, useEffect } from 'react';

export default function useAuth() {
    const [user, setUser] = useState(null);

    // TODO: Check auth status on mount

    return { user };
}
