import { createContext, useContext, useState } from 'react';

const AttendanceContext = createContext();

export function AttendanceProvider({ children }) {
    const [attendance, setAttendance] = useState([]);

    return (
        <AttendanceContext.Provider value={{ attendance, setAttendance }}>
            {children}
        </AttendanceContext.Provider>
    );
}

export const useAttendanceContext = () => useContext(AttendanceContext);
