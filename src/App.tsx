import {onSubmit} from "./helper";
import type {StatusType} from "./helper";
import {useState} from "react";


function UnitAlert({className = ""}: { className?: string }) {
    return <div className={`alert alert-info rounded-4 ${className}`.trimEnd()} role="alert">
        <i className="bi bi-exclamation-triangle"></i> Please enter 💵 as <b>pence</b> !
    </div>;
}

interface ResultCardProps {
    title: string;
    status: StatusType;
    contentLines: string[];
}

function ResultCard({title, status, contentLines}: ResultCardProps) {

    let statusIcon: string;
    let statusClass: string;
    switch (status) {
        case "red":
            statusIcon = "bi-x-circle";
            statusClass = "alert-danger";
            break;
        case "amber":
            statusIcon = "bi-exclamation-circle";
            statusClass = "alert-warning";
            break;
        case "green":
            statusIcon = "bi-check-circle";
            statusClass = "alert-success";
            break;
    }

    return (
        <div className={`alert rounded-4 mb-3 ${statusClass}`.trimEnd()}>
            <div className="d-flex justify-content-between">
                <h3 className="alert-heading">{title}</h3>
                <h3><i className={`bi ${statusIcon}`}></i></h3>
            </div>
            {contentLines.map((line, index) => (
                <p key={index} className="card-text">{line}</p>
            ))}
        </div>
    );
}

function App() {

    const [priceCardData, setPriceCardData] = useState({
        status: "" as StatusType,
        oldPrice: "",
        newPrice: "",
        comment: ""
    });

    const [capacityCardData, setCapacityCardData] = useState({
        status: "" as StatusType,
        averageUsage: "",
        highestUsage: "",
        comment: ""
    });

    return (
        <>
            <header>
                <div className="px-3 py-2 text-bg-dark border-bottom mb-3 shadow">
                    <div className="container-fluid page-width">
                        <h1 id="site-title">Octopus EV Tariff Calculator</h1>
                    </div>
                </div>
            </header>
            <div className="container-fluid page-width" id="main">
                <h2 className="visually-hidden">Data Entry</h2>
                <div className="row d-md-block d-none">
                    <div className="col-12">
                        <UnitAlert/>
                    </div>
                </div>

                {/* Data entry section*/}
                <div className="row gy-3" id="data-entry">
                    <div className="col-md-4">
                        <div className="card h-100 rounded-4">
                            <div className="card-body">
                                <h3 className="card-title"><i className="bi-1-square"
                                                              aria-label="First step"></i> Select usage data file
                                </h3>
                                <p className="card-text">First, go to your Octopus account page <a
                                    href="https://octopus.energy/dashboard/new"
                                    target="_blank">octopus.energy/dashboard</a></p>
                                <p className="card-text">Then, click on <span
                                    className="border border-secondary rounded px-1 py-1 bg-light"><i
                                    className="bi bi-lightning-charge-fill"></i> My energy</span></p>
                                <p className="card-text">Next, scroll to <span
                                    className="border border-secondary rounded px-1 py-1 bg-light">Get your energy geek on</span>
                                </p>
                                <p className="card-text">Select electricity in the dropdown and a date range of
                                    preferably 1 whole
                                    month.</p>
                                <input className="form-control " type="file" id="fileInput" accept=".csv"/>
                            </div>
                        </div>
                    </div>
                    <div className="d-md-none">
                        <UnitAlert className="mb-0"/>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 rounded-4">
                            <div className="card-body">
                                <h3 className="card-title">
                                    <i className="bi-2-square" aria-label="Second step"></i> Current tariff details
                                </h3>
                                <div className="form-floating mb-3">
                                    <input className="form-control" type="number" id="OctopusStanding"
                                           name="OctopusStanding" min="0"
                                           step="0.01"
                                        // defaultValue="1"
                                    />
                                    <label htmlFor="OctopusStanding">Standing Charge 💰</label>
                                </div>
                                <div className="form-floating mb-3">
                                    <input className="form-control" type="number" id="OctopusDay" name="OctopusDay"
                                           min="0"
                                           step="0.01"
                                        // defaultValue="1"
                                    />
                                    <label htmlFor="OctopusDay">Peak rate ☀</label>
                                </div>
                                <div className="form-floating mb-3">
                                    <input className="form-control" type="number" id="OctopusNight" name="OctopusNight"
                                           min="0"
                                           step="0.01"
                                        // defaultValue="1"
                                    />
                                    <label htmlFor="OctopusNight">Off-peak Rate 🌙</label>
                                </div>
                                <div className="form-floating mb-3">
                                    <input className="form-control" type="time" id="OctopusNightStart"
                                           name="OctopusNightStart"
                                           step={1800}
                                        // defaultValue="23:30"
                                    />
                                    <label htmlFor="OctopusNightStart">Off-peak tariff start time</label>
                                </div>
                                <div className="form-floating">
                                    <input className="form-control" type="time" id="OctopusNightEnd"
                                           name="OctopusNightEnd" step={1800}
                                        // defaultValue="05:30"
                                    />
                                    <label htmlFor="OctopusNightEnd">Off-Peak tariff end time</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 rounded-4">
                            <div className="card-body">
                                <h3 className="card-title"><i className="bi-3-square" aria-label="Third step"></i> New
                                    tariff details</h3>
                                <div className="form-floating mb-3">
                                    <input className="form-control" type="number" id="NewStanding" name="NewStanding"
                                           min="0"
                                           step="0.01"
                                        // defaultValue="1"
                                    />
                                    <label htmlFor="NewStanding">Standing charge 💰</label>
                                </div>
                                <div className="form-floating mb-3">
                                    <input className="form-control" type="number" id="NewDay" name="NewDay" min="0"
                                           step="0.01"
                                        // defaultValue="1"
                                    />
                                    <label htmlFor="NewDay">Peak Rate ☀</label>
                                </div>
                                <div className="form-floating mb-3">
                                    <input className="form-control" type="number" id="NewNight" name="NewNight" min="0"
                                           step="0.01"
                                        // defaultValue="1"
                                    />
                                    <label htmlFor="NewNight">Off-Peak Rate 🌙</label>
                                </div>
                                <div className="form-floating mb-3">
                                    <input className="form-control" type="time" id="NewNightStart" name="NewNightStart"
                                           step={1800}
                                           // defaultValue="23:30"
                                    />
                                    <label htmlFor="NewNightStart">Off-peak tariff start time</label>
                                </div>
                                <div className="form-floating">
                                    <input className="form-control" type="time" id="NewNightEnd" name="NewNightEnd"
                                           step={1800}
                                           // defaultValue="05:30"
                                    />
                                    <label htmlFor="NewNightEnd">Off-Peak tariff end time</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 text-end">
                        <input id="submit" className="btn btn-primary rounded-4" type="button" value="Submit"
                               onClick={() => onSubmit(setPriceCardData, setCapacityCardData)}/>
                    </div>
                </div>

                {/*Results section*/}
                <div className="row d-none border-top mt-3" id="result">
                    <h2 className="visually-hidden">Results</h2>
                    <div className="col-md-6  mt-3">
                        <ResultCard
                            title="Price check"
                            status={priceCardData.status}
                            contentLines={[
                                priceCardData.oldPrice,
                                priceCardData.newPrice,
                                priceCardData.comment
                            ]}
                        />
                        <ResultCard
                            title="Capacity check"
                            status={capacityCardData.status}
                            contentLines={[
                                capacityCardData.averageUsage,
                                capacityCardData.highestUsage,
                                capacityCardData.comment
                            ]}
                        />
                    </div>
                    <div className="col-md-6 mt-md-3 d-flex justify-content-center" id="consumptionPieChartContainer">
                        <canvas id="consumptionPieChart"></canvas>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="container-fluid page-width">
                <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 mt-3 border-top">
                    <div className="col-md-4 d-flex align-items-center">
                        <span className="mb-3 mb-md-0 text-body-secondary">Made with <i
                            className="bi bi-heart-fill text-danger"></i> by Chris C</span>
                    </div>
                    <ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
                        <li className="ms-3"><a className="text-body-secondary" href="https://github.com/chrischiux"
                                                target="_blank"
                                                aria-label="GitHub Profile">
                            <i className="bi bi-github"></i>
                        </a></li>
                        <li className="ms-3"><a className="text-body-secondary"
                                                href="https://www.linkedin.com/in/chrischiux/"
                                                target="_blank"
                                                aria-label="LinkedIn Profile">
                            <i className="bi bi-linkedin"></i>
                        </a></li>
                    </ul>
                </footer>
            </div>
        </>
    );
}

export default App;