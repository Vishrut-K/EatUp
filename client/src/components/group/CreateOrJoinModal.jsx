import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight, PlusCircle } from "lucide-react";
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
      showToast(`Joined group order ${room.roomCode}!`, "👥");
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
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/65 p-5 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-[460px] rounded-[18px] bg-white p-7 shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-2xl leading-none text-[#8E9BAE] hover:text-[#111827]"
        >
          &times;
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF7F1] text-[#0D7A53]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#111827]">Collaborative Group Order</h3>
            <p className="text-xs text-[#4B5563]">
              Order together on different devices with live sync &amp; split bills
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-[#FEE2E2] px-3.5 py-2.5 text-sm font-semibold text-[#B91C1C]">
            {errorMsg}
          </div>
        )}

        <div className="mb-5 rounded-xl border border-[#E5EBE7] bg-[#F7FAF8] p-4">
          <h4 className="mb-1 text-sm font-extrabold text-[#111827]">Start a New Group Room</h4>
          <p className="mb-3 text-xs text-[#4B5563]">
            Create a room code, share it with friends, and finalize one combined order when ready.
          </p>
          <button
            type="button"
            disabled={roomLoading}
            onClick={handleCreate}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#0D7A53] to-[#149666] py-2.5 text-sm font-extrabold text-white transition hover:opacity-95 disabled:opacity-60"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{roomLoading ? "Creating Room..." : "Create Group Room"}</span>
          </button>
        </div>

        <form onSubmit={handleJoin} className="rounded-xl border border-[#E5EBE7] bg-white p-4">
          <h4 className="mb-1 text-sm font-extrabold text-[#111827]">Have a Room Code?</h4>
          <p className="mb-3 text-xs text-[#4B5563]">
            Enter the 6-character code shared by your group host.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. EAT7K9"
              maxLength={10}
              className="flex-1 rounded-lg border-[1.5px] border-[#E5EBE7] px-3.5 py-2.5 text-sm font-extrabold tracking-widest uppercase outline-none focus:border-[#0D7A53]"
            />
            <button
              type="submit"
              disabled={roomLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#0D7A53] disabled:opacity-60"
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
