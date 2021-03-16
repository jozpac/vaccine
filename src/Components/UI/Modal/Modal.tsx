import React from 'react'

export default function Modal(props: any) {
  return (
	<div className="modal fade" id="modal" aria-labelledby="exampleModalLabel" aria-hidden="false">
		<div className="modal-dialog modal-lg">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title">{props.title}</h5>
					<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
				</div>
				<div className="modal-body">
					{props.children}
			  	</div>
			</div>
		</div>
	</div>
  )
}
