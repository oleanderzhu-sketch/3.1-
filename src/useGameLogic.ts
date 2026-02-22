import { useState, useEffect, useCallback, useRef } from 'react';
import { GameMode, BlockData, GRID_ROWS, GRID_COLS, INITIAL_ROWS, Difficulty } from './types';

const generateId = () => Math.random().toString(36).substr(2, 9);
const getRandomValue = () => Math.floor(Math.random() * 9) + 1;
const generateTarget = () => Math.floor(Math.random() * 15) + 10;

export const useGameLogic = () => {
  const [grid, setGrid] = useState<BlockData[]>([]);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(generateTarget());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [timeLeft, setTimeLeft] = useState(Difficulty.MEDIUM as number);
  const [isProcessing, setIsProcessing] = useState(false);
  const [combo, setCombo] = useState(0);
  const [lastMatchPos, setLastMatchPos] = useState<{ x: number, y: number } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const initGame = (selectedMode: GameMode, selectedDifficulty: Difficulty = Difficulty.MEDIUM) => {
    const initialGrid: BlockData[] = [];
    for (let r = 0; r < INITIAL_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        initialGrid.push({
          id: generateId(),
          value: getRandomValue(),
          row: GRID_ROWS - 1 - r,
          col: c,
        });
      }
    }
    setGrid(initialGrid);
    setScore(0);
    setTarget(generateTarget());
    setSelectedIds([]);
    setIsGameOver(false);
    setMode(selectedMode);
    setDifficulty(selectedDifficulty);
    setTimeLeft(selectedDifficulty as number);
    setIsProcessing(false);
    setCombo(0);
    setLastMatchPos(null);
  };

  const addNewRow = useCallback(() => {
    setGrid((prevGrid) => {
      // Check for Game Over: if any block is already at row 0, moving up will push it out
      if (prevGrid.some((b) => b.row === 0)) {
        setIsGameOver(true);
        return prevGrid;
      }

      // Move existing blocks up
      const movedGrid = prevGrid.map((b) => ({ ...b, row: b.row - 1 }));

      // Add new row at the bottom
      const newRow: BlockData[] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        newRow.push({
          id: generateId(),
          value: getRandomValue(),
          row: GRID_ROWS - 1,
          col: c,
        });
      }

      setCombo(0); // Reset combo when new row is added
      return [...movedGrid, ...newRow];
    });
  }, []);

  // Timer for Time Mode
  useEffect(() => {
    if (mode === GameMode.TIME && !isGameOver && !isProcessing) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            addNewRow();
            return difficulty as number;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, isGameOver, isProcessing, addNewRow, difficulty]);

  const toggleSelect = (id: string) => {
    if (isGameOver || isProcessing) return;
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      return [...prev, id];
    });
  };

  // Match processing
  useEffect(() => {
    if (selectedIds.length === 0 || isGameOver || isProcessing) return;

    const selectedBlocks = grid.filter((b) => selectedIds.includes(b.id));
    const currentSum = selectedBlocks.reduce((sum, b) => sum + b.value, 0);

    if (currentSum === target) {
      setIsProcessing(true);
      
      // Calculate center of match for animation
      const avgCol = selectedBlocks.reduce((acc, b) => acc + b.col, 0) / selectedBlocks.length;
      const avgRow = selectedBlocks.reduce((acc, b) => acc + b.row, 0) / selectedBlocks.length;
      setLastMatchPos({ x: avgCol, y: avgRow });

      // Delay to show selection
      const timeout = setTimeout(() => {
        const newCombo = combo + 1;
        setCombo(newCombo);
        setScore((s) => s + selectedBlocks.length * 10 * newCombo);
        
        setGrid((prev) => {
          // 1. Remove matched blocks
          const remaining = prev.filter((b) => !selectedIds.includes(b.id));
          
          // 2. Apply gravity column by column
          const gravityGrid: BlockData[] = [];
          for (let c = 0; c < GRID_COLS; c++) {
            const colBlocks = remaining
              .filter((b) => b.col === c)
              .sort((a, b) => b.row - a.row); // Sort bottom to top
            
            colBlocks.forEach((b, index) => {
              gravityGrid.push({ 
                ...b, 
                row: GRID_ROWS - 1 - index // Re-assign rows from bottom
              });
            });
          }

          // 3. Handle Classic Mode: Add a new row
          if (mode === GameMode.CLASSIC) {
            // Check if we can move up
            if (gravityGrid.some((b) => b.row === 0)) {
              setIsGameOver(true);
              return gravityGrid;
            }

            // Move all up
            const shiftedGrid = gravityGrid.map((b) => ({ ...b, row: b.row - 1 }));
            
            // Add new row at bottom
            for (let c = 0; c < GRID_COLS; c++) {
              shiftedGrid.push({
                id: generateId(),
                value: getRandomValue(),
                row: GRID_ROWS - 1,
                col: c,
              });
            }
            return shiftedGrid;
          }

          return gravityGrid;
        });

        setSelectedIds([]);
        setTarget(generateTarget());
        if (mode === GameMode.TIME) setTimeLeft(difficulty as number);
        setIsProcessing(false);
        // Clear last match pos after a bit
        setTimeout(() => setLastMatchPos(null), 500);
      }, 250);

      // We don't return the cleanup here because setting isProcessing(true) 
      // will trigger a re-run and clear this timeout immediately.
      // Instead, we let it run. isProcessing guard at the top prevents multiple timeouts.
    } else if (currentSum > target) {
      // Over sum: clear selection with a tiny delay for feedback
      const timeout = setTimeout(() => {
        setSelectedIds([]);
        setCombo(0); // Reset combo on mistake
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [selectedIds, target, grid, mode, isGameOver, isProcessing, combo, difficulty]);

  return {
    grid,
    score,
    target,
    selectedIds,
    isGameOver,
    mode,
    timeLeft,
    isProcessing,
    combo,
    difficulty,
    lastMatchPos,
    initGame,
    toggleSelect,
    reset: () => setMode(null),
  };
};
