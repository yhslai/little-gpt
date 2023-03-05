

def safe_int(x: str, default: int=0) -> int:
    try:
        return int(x)
    except ValueError:
        return default

def safe_float(x: str, default: float=0.0) -> float:
    try:
        return float(x)
    except ValueError:
        return default
      