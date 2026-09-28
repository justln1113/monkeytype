import { getActiveWordIndex } from "../states/test";
import { decodeUnit, unitTarget, type BopomofoUnit } from "../bopomofo/parse";

type CommitChar = " " | "\n" | "";

type Word = {
  text: string;
  textWithCommit: string;
  commit: CommitChar;
  display: string;
  sectionIndex: number;
  /** set in bopomofo mode: text is the bopomofo to type, this is what is shown */
  bopomofo?: BopomofoUnit;
};

const commitCharsToDisplay: Set<CommitChar> = new Set(["\n"]);

class Words {
  private list: Word[];
  public length: number;

  constructor() {
    this.list = [];
    this.length = 0;
  }

  get(i?: undefined, raw?: boolean): Word[];
  get(i: number, raw?: boolean): Word | undefined;
  get(i?: number, raw = false): Word | Word[] | undefined {
    if (i === undefined) {
      return [...this.list];
    } else {
      const word = this.list[i];
      if (!word) {
        return undefined;
      }
      if (raw) {
        const text = word.text.replace(/[.?!":\-,]/g, "")?.toLowerCase();
        return {
          text,
          textWithCommit: text + word.commit,
          commit: word.commit,
          display:
            text + (commitCharsToDisplay.has(word.commit) ? word.commit : ""),
          sectionIndex: word.sectionIndex,
          bopomofo: word.bopomofo,
        };
      } else {
        return word;
      }
    }
  }
  getCurrent(): Word | undefined {
    return this.list[getActiveWordIndex()];
  }
  push(word: string, sectionIndex: number): Word {
    const unit = decodeUnit(word);
    if (unit !== null) {
      const text = unitTarget(unit);
      const wordObj: Word = {
        text,
        textWithCommit: text,
        commit: "",
        display: text,
        sectionIndex,
        bopomofo: unit,
      };
      this.list.push(wordObj);
      this.length = this.list.length;
      return wordObj;
    }
    let commit: CommitChar = "";
    if (word.endsWith(" ")) {
      commit = " ";
      word = word.slice(0, -1);
    } else if (word.endsWith("\n")) {
      commit = "\n";
      word = word.slice(0, -1);
    }
    const wordObj = {
      text: word,
      textWithCommit: word + commit,
      commit,
      display: word + (commitCharsToDisplay.has(commit) ? commit : ""),
      sectionIndex,
    };
    this.list.push(wordObj);
    this.length = this.list.length;

    return wordObj;
  }

  reset(): void {
    this.list = [];
    this.length = 0;
  }

  removeCommitCharacterFromLastWord(): void {
    if (this.length === 0) return;
    const lastWord = this.list[this.length - 1];
    if (lastWord === undefined || lastWord.text === "") return;
    if (lastWord.commit === " " || lastWord.commit === "\n") {
      lastWord.commit = "";
      lastWord.textWithCommit = lastWord.text;
      lastWord.display = lastWord.text;
    }
  }
}

export const words = new Words();
