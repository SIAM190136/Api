// components/Loading.tsx: centered spinner with optional label
interface LoadingProps {
  label?: string;
  fullScreen?: boolean;
}

export default function Loading({ label = 'লোড হচ্ছে...', fullScreen = false }: LoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-slate-500 ${
        fullScreen ? 'h-[100dvh] w-full' : 'py-8'
      }`}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
