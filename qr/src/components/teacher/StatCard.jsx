const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon size={24} />
                </div>
                <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
