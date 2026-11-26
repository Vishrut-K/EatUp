import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, PlusCircle, Users, X } from "lucide-react";
import { useGroupOrder } from "../../context/GroupOrderContext";
import { useToast } from "../../context/ToastContext";

export function CreateOrJoinModal() {
  const { joinModalOpen, setJoinModalOpen, createRoom, joinRoom, roomLoading } = useGroupOrder();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!joinModalOpen) return null;

  const handleClose = () => {
    setErrorMsg("");
    setRoomCodeInput("");
    setJoinModalOpen(false);
  };

  const handleCreate = async () => {
    setErrorMsg("");
    try {
      const room = await createRoom(null);
      handleClose();
      navigate(`/group/${room.roomCode}`);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to create room.");
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const code = roomCodeInput.trim().toUpperCase();
    if (!code) {
      setErrorMsg("Please enter a valid 6-character room code.");
      return;
    }
    setErrorMsg("");
    try {
      const room = await joinRoom(code);
      handleClose();
      showToast(`Joined group table ${room.roomCode}.`);
      navigate(`/group/${room.roomCode}`);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Could not join room. Check the room code.");
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#1C1917]/65 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-[460px] rounded-3xl border border-[#EAE3D9] bg-[#FAF7F2] p-7 shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-[#EAE3D9] bg-white text-[#57534E] transition hover:border-[#1C1917] hover:text-[#1C1917]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF2EC] text-[#2D5A3C]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold tracking-[0.16em] text-[#2D5A3C] uppercase">
              Shared Dining
            </span>
            <h3 className="font-editorial text-2xl text-[#1C1917]">Collaborative Group Table</h3>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-[#C83E2B]/20 bg-[#FBECE9] px-3.5 py-2.5 text-xs font-semibold text-[#C83E2B]">
            {errorMsg}
          </div>
        )}

        <div className="mb-4 rounded-2xl border border-[#EAE3D9] bg-white p-5">
          <h4 className="mb-1 text-sm font-extrabold text-[#1C1917]">Host a New Group Table</h4>
          <p className="mb-4 text-xs leading-relaxed text-[#57534E]">
            Generate an invite code, add dishes together in real time, and split fees &amp; GST automatically.
          </p>
          <button
            type="button"
            disabled={roomLoading}
            onClick={handleCreate}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C83E2B] py-3 text-sm font-bold text-white transition hover:bg-[#A62F1F] disabled:opacity-60"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{roomLoading ? "Creating Room..." : "Create Group Table"}</span>
          </button>
        </div>

        <form onSubmit={handleJoin} className="rounded-2xl border border-[#EAE3D9] bg-white p-5">
          <h4 className="mb-1 text-sm font-extrabold text-[#1C1917]">Join with Room Code</h4>
          <p className="mb-3 text-xs text-[#57534E]">
            Enter the 6-character code shared by your host.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="EAT7K9"
              maxLength={10}
              className="font-code flex-1 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] px-3.5 py-2.5 text-sm font-bold tracking-widest text-[#1C1917] uppercase outline-none focus:border-[#C83E2B] focus:bg-white"
            />
            <button
              type="submit"
              disabled={roomLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1C1917] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#C83E2B] disabled:opacity-60"
            >
              <span>Join</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
