// components/Avatar.tsx: user avatar (photo or initial) with optional online dot
interface AvatarProps {
  name: string;
  photoURL: string | null;
  size?: number;
  online?: boolean;
}

export default function Avatar({ name, photoURL, size = 40, online }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const style = { width: size, height: size };

  return (
    <div className="relative shrink-0" style={style}>
      {photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoURL}
          alt={name}
          referrerPolicy="no-referrer"
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full bg-indigo-500 font-semibold text-white"
          style={{ fontSize: size * 0.4 }}
        >
          {initial}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
            online ? 'bg-green-500' : 'bg-slate-300'
          }`}
        />
      )}
    </div>
  );
}
