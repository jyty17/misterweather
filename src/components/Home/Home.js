import React from 'react';
import './Home.css';

import searchIcon from './search.svg';
import moustache from './moustache.svg';

class Home extends React.Component {
	constructor() {
		super();
		this.state = {
			hourly: [],
			week: [],
			error: null,
			isloaded: false,
			activetab: 1,
			address: "10002",
			relativelocation: '',
			x: 0,
			y: 0,
			grid: '',
			favorites: [],
			forecast: '',
			forecasthourly: '',
		};
		this.updateStationPoints = this.updateStationPoints.bind(this);
		this.months_short = {
			'0': "Jan",
			'1': "Feb",
			'2': "Mar",
			'3': "Apr",
			'4': "May",
			'5': "Jun",
			'6': "Jul",
			'7': "Aug",
			'8': "Sep",
			'9': "Oct",
			'10': "Nov",
			'11': "Dec",
		};
	}

	componentDidMount() {
		this.getweather();
		this.getFavorites();
	}

	saveFavorites = () => {
		// const { address, x, y, gridid } = this.state;
		const { address, forecast, forecasthourly, favorites, relativelocation } = this.state;
		const ls = localStorage.getItem('MisterWeather');
		let lsjson = JSON.parse(ls);
		console.log(ls)
		const data = {
				forecast,
				forecasthourly,
				relativelocation
			};
		if (lsjson === null) {
			localStorage.setItem('MisterWeather', JSON.stringify({[address]: data}));
			this.setState({
				favorites: [...favorites, address]
			})
		} else {
			if (!lsjson[address]) {
				localStorage.setItem('MisterWeather', JSON.stringify({...lsjson, [address]: data}))
				this.setState({
					favorites: [...favorites, address]
				})
			}
		}
	}

	getFavorites = () => {
		const ls = localStorage.getItem('MisterWeather');
		// console.log("get", ls);
		if (ls) {
			this.setState({
				favorites: Object.keys(JSON.parse(ls))
			})
		}
		
	}

	selectFavorite = (fav) => {
		const selected = fav.target.value;
		const ls = JSON.parse(localStorage.getItem('MisterWeather'))
		console.log(selected, ls, ls[selected]);
		const { forecast, forecasthourly, relativelocation } = ls[selected]
		
		this.updateHourly(forecasthourly);
		this.updateWeekly(forecast);
		this.setState({
			relativelocation
		})
	}

	handlechange = (e) => {
		this.setState({
			address: e.target.value
		});
	}

	selectToday = e => {
		this.setState({
			activetab: 1
		})
		// console.log("1")
	}

	selectWeek = e => {
		this.setState({
			activetab: 2
		})
		// console.log("2")
	}

	// gets and updates hourly weather data
	// updateHourly(x, y, gridId) {
	updateHourly(url) {
		// fetch(`https://api.weather.gov/gridpoints/${gridId}/${x},${y}/forecast/hourly`)
		fetch(url)
			.then( response => response.json() )
			.then(
				(result) => {
					// console.log("response result", result);
					const dat = result.properties.periods;
					if (!dat) {
						this.setState({
							error: dat.detail
						});
					}
					const dateToday = new Date(dat[0].startTime).getDate();
					let todayDat = dat.filter( d => new Date(d.startTime).getDate() === dateToday);
					this.setState({ 
						hourly: todayDat,
						isloaded: true,
					});
				})
			.catch(
				(error) => {
					console.log(error)
					this.setState({
						isloaded: false,
						// error
					})
			})
	}
	// gets and updates weekly weather data
	// updateWeekly(x, y, gridId) {
	updateWeekly(url) {
		// fetch(`https://api.weather.gov/gridpoints/${gridId}/${x},${y}/forecast`)
		fetch(url)
			.then( response => response.json() )
			.then(
				(result) => {
					const dat = result.properties.periods;
					// console.log(dat.length, dat)
					if (!dat) {
						this.setState({
							error: dat.detail
						});
					}
					this.setState({ 
						week: dat,
						isloaded: true,
					});
				})
			.catch(
				(error) => {
					this.setState({
						isloaded: false,
					})
				})
	}

	updateStationPoints = (addr) => {
		return fetch(addr)
			.then(response => response.json())
			.then( (result) => {
				let latlng = result.results["0"].geometry.location
				let lat = latlng.lat
				let lng = latlng.lng
				console.log()
				this.setState({
					relativelocation: result.results["0"].formatted_address
				})
				return fetch(`https://api.weather.gov/points/${lat},${lng}`)
					.then( response => response.json())
					.then( (result) => {
						const res = result.properties;
						// console.log(res.forecast, res.forecastHourly)
						return [res.forecast, res.forecastHourly]
					})
					.catch( error => console.log(error))
			})
			.catch( (error) => console.log(error))
	}


 	getweather = async () => {
 		const addr = this.state.address
 		if (addr.length === 0) {
 			return
 		}
 		const api_key = 'AIzaSyC3Rjz__OFD4PC95xnMlFpOJQvQkvXENr0';
		const location = addr.replaceAll(' ', '+');

		const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${api_key}`;
		// console.log(location, url)
		// const [x, y, gridid] = await this.updateStationPoints(url);

		const [forecast, forecasthourly] = await this.updateStationPoints(url);

		// this.updateHourly(x, y, gridid);
		// this.updateWeekly(x, y, gridid);
		this.updateHourly(forecasthourly);
		this.updateWeekly(forecast);
		this.setState({
			// relativelocation: addr,
			forecasthourly,
			forecast,
		});
		// console.log(this.state);
	}

	render() {
		const {
			activetab, 
			week, 
			hourly, 
			address,
			relativelocation,
			isloaded,
			favorites,
			error,
		} = this.state;

		return(
			<div className="Home">
				<div className="title">
					MisterWeather
					<img src={moustache} alt="" />
				</div>
				<div className="tab-nav flex">
					<div className="flex">
						<div className="tab" onClick={this.selectToday}>Today</div>
						<div className="tab" onClick={this.selectWeek}>This Week</div>
						{ hourly.length !== 0 && week.length !== 0 &&
							<div className="flex">
								<div className="tab" onClick={this.saveFavorites}>Add to favorite</div>
								{ favorites.length !== 0 && 
									<select className="" onChange={this.selectFavorite}>
										{favorites.map( f => 
											<option key={f.key} value={f} >{f}</option>
										)}
									</select> }
							</div>
							
						}
						<div className="favorites"></div>
					</div>
					<div className="flex">
						<input 
							className="search" 
							placeholder="Address or Zipcode" 
							onChange={this.handlechange} 
							value={address}
							/>
						<div 
							className="search-button" 
							type="submit" 
							// value="Search"
							onClick={this.getweather}
							>
							<img className="search-icon" src={searchIcon} />
						</div>
					</div>
				</div>
				<div>
					<div className="panel scroll">
						<div className="panel-option flex">
							<div className="window-circle">&#9679;</div>
							<div className="window-circle">&#9679;</div>
							<div className="window-circle">&#9679;</div>
						</div>
						<div className="panel-content">
							<div>
								{hourly.length !== 0 && week.length !== 0 ? 
									<div>
										<h1>{relativelocation.toUpperCase()}</h1>
										{activetab === 1 && 
											<div>
												<h1>Today</h1>
												<div className="">
													{hourly.map( h => 
														<div className="hourlyforecast flex " key={h.key}>
															<div className="forecastTime">{new Date(h.startTime).getHours()%12}{new Date(h.startTime).getHours() < 13 ? 'AM' : 'PM'}</div>
															<div className="forecastTemp">{h.temperature} &#176;{h.temperatureUnit}</div>
															<div>{h.shortForecast}</div>
															<img className="" src={h.icon} />
														</div>
													)}
												</div>
											</div>
										}
										{activetab === 2 && 
											<div>
												<h1>This Week</h1>
												<div className="weeklyforecast flex">
													{week.map( w =>
														<div className="weeklyforecastdisplay" key={w.key}>
															<div>{this.months_short[new Date(w.startTime).getMonth()]}. {new Date(w.startTime).getDate()}</div>
															<div>{w.name}</div>
															<div>{w.shortForecast}</div>
															<img src={w.icon} alt="" />
															<div>{w.temperature} &#176;{w.temperatureUnit}</div>
														</div>
													)}
												</div>
											</div>
										}
									</div>
									:
									<div>
										{error && <div>{error}</div>}
										<h1 className="">Search for a location!</h1>
									</div>
								}
							</div>
						</div>
					</div>
				</div>
				{/*<button onClick={this.getweather}>test</button>*/}
			</div>
		)
	}
}

export default Home;