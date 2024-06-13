import React from 'react'

type Props = {
    title: string,
    description: string,
    thumbnailSrc: string,
    videoId: string
}

const VideoCard = (props: Props) => {
    return (
        <>
        <div className="card w-96 bg-base-100 shadow-xl mb-3">
        <figure><img src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" /></figure>
        <div className="card-body">
          <h2 className="card-title">
           Title
          </h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
        </div>
      </div>
      </>
    )
}

export default VideoCard