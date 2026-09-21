export default function Card({image, name, description}: any) {
  return (
    (image && name && description) ?
      <div className="card bg-base-100 shadow-xl cursor-pointer">
        <figure>
            <img
              src={image}
              alt="nft images" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{name}</h2>
          <p>{description}</p>
        </div>
      </div>
      :
      <div className="card skeleton bg-base-100 shadow-xl"/>
  )
}
