import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, Gamepad2, X, Circle, Lock } from "lucide-react";
import { toast } from "sonner";

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhoneModal = ({ isOpen, onClose }: PhoneModalProps) => {
  const [activeApp, setActiveApp] = useState<"home" | "videos" | "tictactoe">("home");
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [isVIP, setIsVIP] = useState(false); // VIP status
  const [isSinging, setIsSinging] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Bot makes a move after player
  useEffect(() => {
    if (!isXTurn && !winner && activeApp === "tictactoe") {
      const timer = setTimeout(() => {
        makeBotMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXTurn, winner, board, activeApp]);

  const handleSquareClick = (index: number) => {
    if (board[index] || winner || !isXTurn) return; // Player is X, bot is O

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      toast.success(`${gameWinner} wins! 🎉`);
      return;
    } else if (newBoard.every(cell => cell !== null)) {
      toast.info("It's a draw!");
      return;
    }

    setIsXTurn(false); // Bot's turn
  };

  const makeBotMove = () => {
    if (winner) return;

    const emptySquares = board.map((cell, i) => cell === null ? i : null).filter(i => i !== null) as number[];
    if (emptySquares.length === 0) return;

    // Simple AI: Try to win, block player, or take center/corner
    let botMove = findWinningMove(board, "O");
    if (botMove === null) botMove = findWinningMove(board, "X"); // Block player
    if (botMove === null && board[4] === null) botMove = 4; // Take center
    if (botMove === null) {
      const corners = [0, 2, 6, 8].filter(i => board[i] === null);
      if (corners.length > 0) botMove = corners[Math.floor(Math.random() * corners.length)];
    }
    if (botMove === null) botMove = emptySquares[Math.floor(Math.random() * emptySquares.length)];

    const newBoard = [...board];
    newBoard[botMove] = "O";
    setBoard(newBoard);
    setIsXTurn(true);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      toast.success(`${gameWinner} wins! 🎉`);
    } else if (newBoard.every(cell => cell !== null)) {
      toast.info("It's a draw!");
    }
  };

  const findWinningMove = (squares: (string | null)[], player: string): number | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      const vals = [squares[a], squares[b], squares[c]];
      if (vals.filter(v => v === player).length === 2 && vals.includes(null)) {
        if (squares[a] === null) return a;
        if (squares[b] === null) return b;
        if (squares[c] === null) return c;
      }
    }
    return null;
  };

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
    setWinner(null);
  };

  const videos = [
    { id: 1, title: "Jingle Bells", icon: "🔔" },
    { id: 2, title: "Silent Night", icon: "🌙" },
    { id: 3, title: "Deck the Halls", icon: "🎄" },
  ];

  const handleVideoClick = async (video: typeof videos[0]) => {
    if (!isVIP || isSinging) return;
    
    setIsSinging(true);
    setSelectedVideo(video.title);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/advero-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: `Write a short, festive Christmas song for "${video.title}". Keep it under 100 words with verses and chorus.`,
          type: 'song'
        })
      });

      const data = await response.json();
      
      if (data.text && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;
        utterance.onend = () => {
          setIsSinging(false);
          setSelectedVideo(null);
        };
        utterance.onerror = () => {
          setIsSinging(false);
          setSelectedVideo(null);
          toast.error("Failed to sing the song");
        };
        window.speechSynthesis.speak(utterance);
        toast.success(`🎤 Singing ${video.title}...`);
      }
    } catch (error) {
      console.error('Error singing song:', error);
      toast.error("Failed to generate song");
      setIsSinging(false);
      setSelectedVideo(null);
    }
  };

  const renderHome = () => (
    <div className="grid grid-cols-2 gap-4 p-4">
      <Button
        variant="outline"
        className="h-24 flex flex-col gap-2"
        onClick={() => setActiveApp("videos")}
      >
        <Video className="w-8 h-8 text-red-500" />
        <span>Videos</span>
      </Button>
      <Button
        variant="outline"
        className="h-24 flex flex-col gap-2"
        onClick={() => setActiveApp("tictactoe")}
      >
        <Gamepad2 className="w-8 h-8 text-purple-500" />
        <span>Tic Tac Toe</span>
      </Button>
    </div>
  );

  const renderVideos = () => {
    if (!isVIP) {
      return (
        <div className="p-4 space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveApp("home")}
            className="mb-2"
          >
            ← Back
          </Button>
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Lock className="w-16 h-16 text-yellow-500" />
            <p className="text-lg font-semibold">VIP Content</p>
            <p className="text-sm text-muted-foreground text-center">
              Videos are exclusive to VIP members!<br />
              Unlock premium content to watch.
            </p>
            <Button
              variant="default"
              onClick={() => {
                setIsVIP(true);
                toast.success("Welcome to VIP! 🌟");
              }}
              className="gap-2"
            >
              <Lock className="w-4 h-4" />
              Unlock VIP Access
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveApp("home")}
          className="mb-2"
        >
          ← Back
        </Button>
        <div className="space-y-2">
          {videos.map((video) => (
            <div
              key={video.id}
              className={`bg-muted p-3 rounded-lg cursor-pointer transition-colors ${
                isSinging && selectedVideo === video.title
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
              onClick={() => handleVideoClick(video)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-16 h-12 rounded flex items-center justify-center text-2xl ${
                  isSinging && selectedVideo === video.title ? 'animate-pulse' : ''
                }`}>
                  {isSinging && selectedVideo === video.title ? '🎤' : video.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm">{video.title}</p>
                  <p className="text-xs opacity-70">
                    {isSinging && selectedVideo === video.title ? 'Singing...' : 'Tap to play'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTicTacToe = () => (
    <div className="p-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActiveApp("home")}
        className="mb-4"
      >
        ← Back
      </Button>
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <p className="text-lg font-semibold">
            {winner ? `Winner: ${winner}!` : `Turn: ${isXTurn ? "You (X)" : "Bot (O)"}`}
          </p>
          <p className="text-xs text-muted-foreground">Playing against AI Bot</p>
        </div>
        <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleSquareClick(index)}
              className="w-20 h-20 bg-muted hover:bg-accent transition-colors rounded-lg flex items-center justify-center text-3xl font-bold border-2 border-border"
            >
              {cell === "X" ? (
                <X className="w-12 h-12 text-blue-500" />
              ) : cell === "O" ? (
                <Circle className="w-12 h-12 text-red-500" />
              ) : null}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={resetGame}
          className="w-full"
        >
          New Game
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📱 Mobile Phone
          </DialogTitle>
        </DialogHeader>
        <div className="bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border-4 border-black min-h-[400px]">
          {activeApp === "home" && renderHome()}
          {activeApp === "videos" && renderVideos()}
          {activeApp === "tictactoe" && renderTicTacToe()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
