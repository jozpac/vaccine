import React from 'react'

export default function Place(props: any) {
  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5>{props.title}, {props.street} {props.streetnumber || ''}</h5>
        <i>Očkovanie od veku {props.age} rokov</i>
      </div>
      <div className="card-body">
        <p className="mb-0">
          Voľné očkovacie miesta: <strong>{props.free}</strong>
        </p>

        {
          props.dates?.length > 0 && (
            <div className="mt-3">
              <a className="btn btn-primary" data-bs-toggle="collapse" href={`#collapse-${props.id}`} role="button" aria-expanded="false" aria-controls="collapse">
                Zobraziť dostupné termíny
              </a>
              <button className="btn btn-dark ms-1" onClick={props.popupfunc}>
                Prihlásiť sa
              </button>
              
              <div className="collapse mt-3" id={`collapse-${props.id}`}>
                <ul className="list-group">
                  {props.dates.map((date: any) => (
                    <li key={date.date} className="list-group-item">{date.date} - <strong>{date.count} voľných miest</strong></li>
                  ))}
                </ul>
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}
