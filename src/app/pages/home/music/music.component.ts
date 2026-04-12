import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home-game-music',
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MusicComponent implements AfterViewInit, OnChanges {

  @Input() musicUrl: string;
  @Input() title: string;
  @ViewChild('audioPlayer', { static: false }) private audioPlayer: ElementRef<HTMLAudioElement>;
  @ViewChild('progressBar', { static: false }) private progressBar: ElementRef<HTMLCanvasElement>;

  playButton = 'active';
  pauseButton = 'hidden';
  activeBar = '';
  totalTime: string;
  elapsedTime: string;

  readonly progressBarWidth = 100;
  readonly progressBarHeight = 8;

  private firstTimeLoadingComponent = true;

  private context: CanvasRenderingContext2D;

  constructor() { }

  ngAfterViewInit(): void {
    if (this.firstTimeLoadingComponent) {
      this.reset();
      this.firstTimeLoadingComponent = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
      // if this is the first time loading this component, then defer the initialization until ngAfterViewInit() is called
      if (!this.firstTimeLoadingComponent) {
        this.reset();
      }
  }

  reset() {
    this.resetButtons();
    this.resetIndicators();
  }

  play() {
    this.playButton = 'hidden';
    this.pauseButton = 'active';
    this.activeBar = 'activeBar';

    this.audioPlayer.nativeElement.play();
  }

  pause() {
    this.playButton = 'active';
    this.pauseButton = 'hidden';

    this.audioPlayer.nativeElement.pause();
  }

  seek(e: MouseEvent) {
    if (this.audioPlayer.nativeElement.currentTime > 0) {
      const rect = this.progressBar.nativeElement.getBoundingClientRect();
      const clickX = e.clientX;
      const offsetX = clickX - rect.left;
      const width = rect.width;

      const percent = offsetX / width;
      this.context.fillStyle = '#464646';
      this.context.fillRect(offsetX, 0, this.progressBarWidth, this.progressBarHeight);
      this.audioPlayer.nativeElement.currentTime = percent * this.audioPlayer.nativeElement.duration;
    }
  }

  setTotalTime() {
    this.totalTime = this.convertElapsedTime(this.audioPlayer.nativeElement.duration);
  }

  updateProgress() {
    if (this.audioPlayer.nativeElement.currentTime > 0) {
      const progress = this.audioPlayer.nativeElement.currentTime / this.audioPlayer.nativeElement.duration * this.progressBarWidth;
      const gradient = this.context.createLinearGradient(0, 0, progress, this.progressBarHeight);
      gradient.addColorStop(0, '#575757');
      gradient.addColorStop(1, '#898989');
      this.context.fillStyle = gradient;
      this.context.fillRect(0, 0, progress, this.progressBarHeight);

      this.elapsedTime = this.convertElapsedTime(this.audioPlayer.nativeElement.currentTime);
    }
  }

  private resetButtons() {
    this.playButton = 'active';
    this.pauseButton = 'hidden';
    this.activeBar = '';

    this.elapsedTime = this.convertElapsedTime(0);
  }

  private resetIndicators() {
    this.audioPlayer.nativeElement.src = this.musicUrl;
    this.audioPlayer.nativeElement.load();

    this.context = this.progressBar.nativeElement.getContext('2d');
    this.context.fillStyle = '#464646';
    this.context.fillRect(0, 0, this.progressBarWidth, this.progressBarHeight);
  }

  private convertElapsedTime(time: number): string {
    const seconds: number = Math.floor(time % 60);
    let secondsString: string;
    if (seconds < 10) {
      secondsString = '0' + seconds;
    } else {
      secondsString = seconds.toString();
    }

    const minutes: number = Math.floor(time / 60);

    return minutes + ':' + secondsString;
  }
}
