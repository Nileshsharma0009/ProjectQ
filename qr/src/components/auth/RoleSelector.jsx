function RoleSelector({ role, setRole }) {
  const roles = ["student", "teacher", "admin"];

  return (
    <div className="flex justify-center gap-3 mb-6">
      {roles.map((r) => (
        <button
          key={r}
          onClick={() => setRole(r)}
          className={`px-4 py-2 rounded-lg text-sm capitalize transition ${
            role === r
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

export default RoleSelector;
