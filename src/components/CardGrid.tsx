<div className="px-4 sm:px-6 md:px-12 lg:px-24 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
  {cards.map((card, index) => (
    <Card key={index} {...card} />
  ))}
</div>