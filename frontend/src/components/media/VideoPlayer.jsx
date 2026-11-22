import styles from './Media.module.css'

// The recordings are silent screen captures of the environment (no audio track), so there is
// nothing to caption; the caption below the video says what it shows and what it does not.
export default function VideoPlayer({ video, width = 600, height = 400 }) {
  return (
    <figure className={styles.figure}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video className={styles.video} controls preload="metadata" width={width} height={height} aria-label={video.title}>
        <source src={video.src} type="video/mp4" />
        Your browser cannot play this video. You can download it from the project repository.
      </video>
      <figcaption className={styles.caption}>
        <strong>{video.title}.</strong> {video.caption}
        {video.repoUrl && (
          <>
            {' '}
            <a href={video.repoUrl} target="_blank" rel="noopener noreferrer">
              File in the repository<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </>
        )}
      </figcaption>
    </figure>
  )
}
