import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "wouter";
import { Field } from "@/components/Field";
import { Avatar } from "@/components/layout/Avatar";
import { PageHeading } from "@/components/layout/PageHeading";
import { Palette } from "@/components/moods/Palette";
import { Window } from "@/components/y2k/Window";
import { createLocalImagePreview } from "@/lib/local-assets";
import { useAestheticStore } from "@/stores/aesthetic-store";
import { notify } from "@/stores/toast-store";
import { useUserStore } from "@/stores/user-store";

export function ProfilePage() {
  const { user, updateUser } = useUserStore();
  const favorites = useAestheticStore((state) => state.aesthetics).filter(
    (mood) => mood.favorited,
  );
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const fileRef = useRef<HTMLInputElement>(null);

  const changeAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Choose an image file for your profile photo.");
      return;
    }
    try {
      const preview = await createLocalImagePreview(file, 360);
      updateUser({ avatar: preview.url });
      notify("Profile photo saved.");
    } catch {
      notify("Could not open that image. Choose another file.");
    }
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    updateUser({ name: name.trim() || "Creator", email });
    notify("Profile saved.");
  };

  return (
    <>
      <PageHeading
        title="Profile"
        description="Your details and the moods you have saved."
      />
      <div className="profile-grid">
        <Window title="About you" slab>
          <form className="form" onSubmit={save}>
            <div className="profile-photo">
              <Avatar user={{ ...user, name }} size={84} />
              <button
                type="button"
                className="btn"
                onClick={() => fileRef.current?.click()}
              >
                Change photo
              </button>
              <input
                ref={fileRef}
                hidden
                type="file"
                accept="image/*"
                onChange={(event) => void changeAvatar(event)}
              />
            </div>
            <Field
              label="Display name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="muted">Your details stay in this browser.</p>
            <div className="row">
              <button className="btn btn--primary">Save profile</button>
            </div>
          </form>
        </Window>
        <Window title="Saved moods">
          {favorites.length ? (
            <ul className="list">
              {favorites.map((mood) => (
                <li key={mood.id}>
                  <img className="list-thumb" src={mood.images[0]} alt="" />
                  <div className="list-main">
                    <strong>{mood.name}</strong>
                    <span className="muted">{mood.category}</span>
                  </div>
                  <Palette colors={mood.palette} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Save a mood to keep its palette here.</p>
          )}
          <Link href="/explore" className="btn btn--full">
            Browse moods
          </Link>
        </Window>
      </div>
    </>
  );
}
