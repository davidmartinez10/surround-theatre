function VideoPlayer({ class: className }: { class?: string }) {
  return (
    <x-box class={className} style="width: 100%; height: 100%; padding: 0.5rem;">
      <video controls>
        <source src="" type="video/mp4" />
      </video>
    </x-box>
  );
}

export default VideoPlayer;