import { TFile } from "obsidian";

export class BlockingQueue<T> {
    private queue: T[] = [];
    private putQueue: (() => void)[] = [];
    private takeQueue: (() => void)[] = []; 
    private lock: boolean = false;
    constructor(private capacity: number) {}

    async put(item: T): Promise<void> {
      if (this.queue.length >= this.capacity) await new Promise<void>(resolve => this.putQueue.push(resolve));
      if (!this.lock) {
        this.queue.push(item);
        if (this.takeQueue.length !== 0) {
          const first = this.takeQueue.shift();
          if (first)
            first();
        }        
      }
    }
  
    async take(): Promise<T|undefined> {
      if (this.queue.length === 0) await new Promise<void>(resolve => this.takeQueue.push(resolve));
      if (!this.lock) {
        const item = this.queue.shift()!;
        if (this.putQueue.length !== 0) {
          const first = this.putQueue.shift();
          if (first) first();
        }
        return item;        
      }
      return undefined;
    }

    clear() {
      this.lock = true;
      for (const putq of this.putQueue) 
        if (putq) putq();
      for (const takeq of this.takeQueue) 
        if (takeq) takeq();
      this.queue = [];
      this.putQueue = [];
      this.takeQueue = [];
      this.lock = false;
    }
}

export class AttachmentItem {

  constructor(public attachFile: TFile, public time: number, public activeFile: string) {}

}







