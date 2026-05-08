export default function WeekdayHeader() {
  const days = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="grid grid-cols-7 mb-1">
      {days.map((d, i) => (
        <div
          key={i}
          className={`text-center text-xs font-medium py-1.5 ${
            i === 0 || i === 6 ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {d}
        </div>
      ))}
    </div>
  );
}
