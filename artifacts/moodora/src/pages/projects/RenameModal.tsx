import { useState, type FormEvent } from "react";
import { Field } from "@/components/Field";
import { Modal } from "@/components/y2k/Modal";
import type { Project } from "@/models";

interface RenameModalProps {
  project: Project;
  onRename: (title: string) => void;
  onClose: () => void;
}

export function RenameModal({ project, onRename, onClose }: RenameModalProps) {
  const [title, setTitle] = useState(project.title);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onRename(title.trim());
    onClose();
  };
  return (
    <Modal title="Rename project" onClose={onClose} className="modal--small">
      <form className="form" onSubmit={submit}>
        <Field
          label="Project name"
          name="project-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="row row--end">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" disabled={!title.trim()}>
            Rename
          </button>
        </div>
      </form>
    </Modal>
  );
}
