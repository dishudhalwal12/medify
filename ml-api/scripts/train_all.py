import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from scripts.train_diabetes import main as train_diabetes
from scripts.train_heart import main as train_heart
from scripts.train_kidney import main as train_kidney
from scripts.train_liver import main as train_liver


def main() -> None:
    train_diabetes()
    train_heart()
    train_kidney()
    train_liver()


if __name__ == "__main__":
    main()
