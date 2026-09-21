import Card from "./Card"

export default function Collections({collections}:any) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {collections.map((value:any,index:any) =>
        <Card key={index} image={value.image} name={value.name} description={value.symbol} />
      )}
    </div>
  )
}
