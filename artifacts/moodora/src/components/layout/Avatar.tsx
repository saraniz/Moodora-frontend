import { initials } from "@/lib/initials";
import type { User } from "@/models";

export function Avatar({ user, size }: { user: User; size: number }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {user.avatar ? (
        <img className="photo" src={user.avatar} alt="" />
      ) : (
        initials(user.name)
      )}
    </span>
  );
}
