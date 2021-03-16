import React, { Component } from 'react';
import './Assets/Styles/Global.scss';

import Place from './Components/Place/Place';
import Loader from './Components/UI/Loader/Loader';
import Modal from './Components/UI/Modal/Modal';

const ITEMS_PER_PAGE = 8;

export default class App extends Component {
	modal = null as any;

	state = {
		loading: true,

		places: [[]],
		free_capacities: {
			count: 0,
			where: [] as Array<object>
		},

		openedPlace: {} as any,

		active_page: 0
	}


	componentDidMount() {
		const a = async () => new Promise((resolve, reject) => {
			return fetch("https://mojeezdravie.nczisk.sk/api/v1/web/get_all_drivein_times_vacc", {
			  "headers": {
				"accept": "application/json, text/plain, */*",
			  },
			  "referrer": "https://www.old.korona.gov.sk/",
			  "method": "GET",
			}).then(r => resolve(r.json()))
			.catch(e => reject(e.message));
		});
		
		(async() => {
			await a().then((response: any) => {
				/* 
					Create neecessary variables for updating state.
				*/
				const data = response?.payload ?? [];
				let newData: Array<object> = [];
				let newDataChunks: Array<object> = [];

				/* 
					Loop through payload - recieved from the server
					(Payload contains all needed data that we're going to process)
				*/
				data.forEach((place: any) => {
					/* 
						Create another necessary variables for updating the state after the response has been recieved.
						We create totalFreePlaces - the count of available vaccines. 
						We create freeDates - array holding the DATE and the COUNT - available vaccines for the looped place.
					*/
					const calendarData = place?.calendar_data;
					let totalFreePlaces = 0;
					let freeDates: Array<object> = [];

					/* 
						The specific row for each vaccination centres contains the "calendar_data" property
						which we are looping here and updating the state.
						We create freePlacesForDate - available vaccines for this date.
						We update: 
						- Total count of capacities
						- Dates and places where the vaccine is available.
					*/
					calendarData.forEach((calendar: any) => {
						const updatedStateCapacity = { ...this.state.free_capacities }
						let freePlacesForDate = 0;

						/* 
							Set the count of free places for the specific date.
							Add the specific value to the total count and set the state.
						*/
						freePlacesForDate = calendar.free_capacity || 0;

						updatedStateCapacity.count += freePlacesForDate;

						this.setState({
							free_capacities: updatedStateCapacity
						});
						

						
						/* 
							Here we add the specific value of free capacities for the specific date to the
							total count of free capacities.
						*/
						totalFreePlaces += freePlacesForDate;
						// Check if we have any available capacities for this date.
						if (freePlacesForDate) {
							// Explode the date and format it in the right way.
							const dateExploded = calendar.c_date.split('-');
							const newDate = `${dateExploded[2]}.${dateExploded[1]}.${dateExploded[0]}`;

							// Push a new value to the free dates array for the specific vaccine center.
							freeDates.push({
								count: calendar.free_capacity,
								date: newDate,
							});
						}
					})

					// If we do have more than 0 total available places with free capacities. Continue.
					if (totalFreePlaces) {
						/* 
							Here we are copying the state so we update it immutably.
							Push the new available place with vaccines to the array holding them and update the state.
						*/
						const updatedStateCapacity = { ...this.state.free_capacities }
						updatedStateCapacity.where.push({
							id: place?.id,
							title: place?.title,
							count: totalFreePlaces
						});

						this.setState({
							free_capacities: updatedStateCapacity
						});
					}

					/* 
						Here we are pushing all the necessary data to our own formatted object.
					*/
					newData.push({
						id: +place?.id,
						age_from: +place?.age_from,
						total_free: totalFreePlaces,
						free_dates: freeDates,
						city: place?.city,
						country: place?.county_name,
						postal: +place?.postal_code,
						region: place?.region_name,
						street: place?.street_name,
						street_num: +place?.street_number,
						title: place?.title,
					});

				});

				/* 
					Break all the centres into chunks so we can paginate them.
				*/
				while (newData.length) {
					newDataChunks.push(newData.splice(0, ITEMS_PER_PAGE));
				}
				
				// Update the final state - EVERYTHING IS LOADED.
				this.setState({
					places: newDataChunks,
					loading: false,
				});

			}).catch((error) => {
				console.log(error);
				alert('Vyskytla sa chyba :-(')
			});
		})()
	}

	changePage = (e: any, page: number) => {
		e.preventDefault();

		this.setState({
			active_page: page
		})
	}

	showDetail = (e: any, id: number) => {
		e.preventDefault();
		id = +id;

		let copyPlacesState = [...this.state.places];
		let specificPlace = [] as Array<object>;

		copyPlacesState.forEach((chunk: Array<object>) => {
			let specificChunk = [...chunk];

			if (specificPlace.length === 0) {
				specificPlace = specificChunk.filter((place: any) => {
						return place.id === id;
					})
			}
		});

		this.setState({
			openedPlace: specificPlace?.[0] || {}
		});
	}



	openPopup = (data: any) => {
		window.open('https://www.old.korona.gov.sk/covid-19-vaccination-form.php', 'popup', 'width=900,height=700') as any;
	}


	render() {
		return (
			<>
				<nav className="navbar navbar-expand navbar-dark bg-dark mb-5">
					<div className="container">
						<span className="navbar-brand">
							Očkovacie miesta
						</span>

						<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
							<span className="navbar-toggler-icon"></span>
						</button>

						<div className="collapse navbar-collapse" id="navbarSupportedContent">
							<ul className="navbar-nav ms-auto">
								<li className="nav-item">
									<span className="text-light">
										Celkom voľných miest: <strong>{this.state.free_capacities.count || 0}</strong>
									</span>
								</li>
							</ul>
						</div>
					</div>
				</nav>

				<div className="text-center">
					<h4>
						Aktuálne voľné miesta:
					</h4>
					<ul className="list-group">
						{
							this.state.free_capacities.where.map((whereIsFree: any) => (
								<li key={whereIsFree.id}>
									<a href="/" onClick={(e) => this.showDetail(e, whereIsFree.id)} data-bs-toggle="modal" data-bs-target="#modal">
										{whereIsFree.title}
									</a>
									<strong> (Voľných miest: {whereIsFree.count})</strong>
								</li>
							))
						}
					</ul>
					{
						this.state.free_capacities.where.length === 0 && (
							<strong>Žiadne</strong>
						)
					}
				</div>
		

				<div className="container mt-4 position-relative">
					{
						this.state.loading && <Loader />
					}


					{
						this.state.places[this.state.active_page].map<any>((place: any) => (
							<Place
									key={place?.id}
									id={place?.id}
									title={place?.title}
									country={place?.country}
									region={place?.region}
									street={place?.street}
									streetnumber={place?.street_num}
									postal={place?.postal}
									free={place?.total_free}
									dates={place?.free_dates}
									age={place?.age_from}
									popupfunc={() => this.openPopup(place)}
								/>
						))
					}

					<div className="d-flex justify-content-center align-items-center overflow-scroll">
						<nav aria-label="Page navigation example">
							<ul className="pagination">
								{
									this.state.places.map((_, idx) => (
										<li key={idx} className={`page-item ${this.state.active_page === idx ? 'active' : ''}`}>
											<a className={`page-link`} href="/" style={{cursor: 'pointer'}} onClick={(e) => this.changePage(e, idx)}>
												{idx+1}
											</a>
										</li>
									))
								}
							</ul>
						</nav>
					</div>
				
				</div>


				<Modal title={this.state.openedPlace?.title}>
					<Place
							key={this.state.openedPlace?.id}
							id={this.state.openedPlace?.id}
							title={this.state.openedPlace?.title}
							country={this.state.openedPlace?.country}
							region={this.state.openedPlace?.region}
							street={this.state.openedPlace?.street}
							postal={this.state.openedPlace?.postal}
							free={this.state.openedPlace?.total_free}
							dates={this.state.openedPlace?.free_dates}
							age={this.state.openedPlace?.age_from}
							popupfunc={() => this.openPopup(this.state.openedPlace)}
						/>
				</Modal>
			</>
		)
	}
}
