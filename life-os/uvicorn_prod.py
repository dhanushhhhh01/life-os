# Optimized uvicorn config for better performance
import uvicorn
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        workers=2,  # Multiple workers for concurrency
        loop="uvloop",  # Faster event loop
        log_level="warning",  # Less logging overhead
    )
