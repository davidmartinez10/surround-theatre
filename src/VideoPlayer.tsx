function VideoPlayer({ class: className }: { class?: string }) {
  return (
    <x-box class={className} style="width: -webkit-fill-available; height: -webkit-fill-available; padding: 0.5rem;">
      <video controls>
        <source src="" type="video/mp4" />
      </video>
    </x-box>
  );
}

export default VideoPlayer;