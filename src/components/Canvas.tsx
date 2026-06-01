import { useRef, useEffect } from 'react';

interface CanvasProps {
  draw: (ctx: CanvasRenderingContext2D, dt: number) => void;
  className?: string;
  effect?: (canvas: HTMLCanvasElement) => (() => void);
}

function Canvas({ draw, className, effect }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastTimeRef = useRef<number>(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      return;
    }
    const resizeListener = () => {
      const dpr = window.devicePixelRatio;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width*dpr;
      canvas.height = rect.height*dpr;
      ctx.scale(dpr, dpr);
      draw(ctx, 0);
    };
    resizeListener();
    let animationFrameId: number;
    const render = (time: number) => {
      time /= 1000;
      const dt = lastTimeRef.current ? time - lastTimeRef.current : 0;
      lastTimeRef.current = time;
      draw(ctx, Number.isNaN(dt) ? 0 : Math.min(0.02, dt));
      animationFrameId = window.requestAnimationFrame(render);
    };
    render(0);
    let effectCleanup = () => {};
    if (effect) {
      effectCleanup = effect(canvas);
    }
    const resizeObserver = new ResizeObserver(() => {
      resizeListener();
    });
    resizeObserver.observe(canvas);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      effectCleanup();
    };
  }, [draw, effect]);
  return <canvas className={className} ref={canvasRef}></canvas>;
}

export default Canvas;
