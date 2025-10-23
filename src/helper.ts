import type {Chart as ChartJS, ChartConfiguration} from 'chart.js';
import Chart from 'chart.js/auto';

let consumptionChart: ChartJS;

export type StatusType = "red" | "amber" | "green";

export function updateResult(
    oldPrice: number,
    newPrice: number,
    NewNightStart: Date,
    NewNightEnd: Date,
    highestOffPeakConsumption: number,
    averageOffPeakConsumption: number,
    setPriceCardData: (data: { status: StatusType; oldPrice: string; newPrice: string; comment: string }) => void,
    setCapacityCardData: (data: { status: StatusType; averageUsage: string; highestUsage: string; comment: string }) => void
) {

    let priceStatus: StatusType;
    let priceComment: string;

    // Update price card status
    if (oldPrice > newPrice) {
        priceStatus = "green";
        priceComment = "Total Cost with new tariff is lower!"
    } else if (oldPrice == newPrice) {
        priceStatus = "amber";
        priceComment = "The current & new tariff price is the same. If you are planning to increase your off-peak usage, a saving might be possible.";
    } else {
        priceStatus = "red";
        priceComment = "Total Cost with new tariff is higher!"
    }


    // Update price card
    setPriceCardData({
        status: priceStatus,
        oldPrice: "Current tariff price: £" + oldPrice.toFixed(2),
        newPrice: "New tariff price: £" + newPrice.toFixed(2),
        comment: priceComment
    });


    // Determine capacity card status and comment
    const UKMaxAmps = 32;
    const UKVoltage = 230;
    const singlePhaseMaxWatthourPerHour = UKMaxAmps * UKVoltage;

    const newTotalOffPeakHours = getNumberOffPeakHour(NewNightStart, NewNightEnd);

    let capacityStatus: StatusType;
    let capacityComment: string;

    if (highestOffPeakConsumption / newTotalOffPeakHours > singlePhaseMaxWatthourPerHour) {
        capacityStatus = "amber";
        capacityComment = "The new off-peak duration may not be sufficient to cover your off-peak consumption. (Assuming a 32Amps Charger is used)";
    } else {
        capacityStatus = "green";
        capacityComment = "The new off-peak duration is sufficient to cover your highest off-peak consumption. (Assuming a 32Amps Charger is used)";
    }

    // Update capacity card
    setCapacityCardData({
        status: capacityStatus,
        averageUsage: "Average off-peak usage: " + averageOffPeakConsumption.toFixed(2) + " kWh",
        highestUsage: "Highest single day off-peak usage: " + highestOffPeakConsumption.toFixed(2) + " kWh",
        comment: capacityComment
    });

    // Unhide and scroll to the results section
    const resultDiv = document.getElementById('result') as HTMLElement;
    resultDiv.classList.remove('d-none');
    resultDiv.scrollIntoView({behavior: 'smooth'});
}


export function onSubmit(
    setPriceCardData: (data: { status: StatusType; oldPrice: string; newPrice: string; comment: string }) => void,
    setCapacityCardData: (data: {
        status: StatusType;
        averageUsage: string;
        highestUsage: string;
        comment: string
    }) => void
) {

    let file: File;
    // const fileInput = $( "#fileInput" )[0] as HTMLInputElement;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;

    let numberOfFilesSelected: number;
    if (fileInput.files) {
        numberOfFilesSelected = fileInput.files.length;
    } else {
        return;
    }

    // Check if a file is selected
    if (numberOfFilesSelected == 1) {
        file = fileInput.files[0];
    } else {
        alert('Please select a CSV file.');
        return;
    }

    const OctopusPeakRate: number = parseFloat((document.getElementById("OctopusDay") as HTMLInputElement).value);
    const OctopusOffPeakRate: number = parseFloat((document.getElementById("OctopusNight") as HTMLInputElement).value);
    const OctopusStanding: number = parseFloat((document.getElementById("OctopusStanding") as HTMLInputElement).value);
    const OctopusNightStart = new Date("1990-01-01T" + (document.getElementById("OctopusNightStart") as HTMLInputElement).value);
    const OctopusNightEnd = new Date("1990-01-01T" + (document.getElementById("OctopusNightEnd") as HTMLInputElement).value);

    const NewPeakRate: number = parseFloat((document.getElementById("NewDay") as HTMLInputElement).value);
    const NewOffPeakRate: number = parseFloat((document.getElementById("NewNight") as HTMLInputElement).value);
    const NewStanding: number = parseFloat((document.getElementById("NewStanding") as HTMLInputElement).value);
    const NewNightStart = new Date("1990-01-01T" + (document.getElementById("NewNightStart") as HTMLInputElement).value);
    const NewNightEnd = new Date("1990-01-01T" + (document.getElementById("NewNightEnd") as HTMLInputElement).value);

    const reader = new FileReader();

    reader.readAsText(file);
    reader.onload = function () {

        // Get result of FileReader
        const text = reader.result as string;

        // Parse CSV data
        const data = text.split('\n').map(line => line.split(', '));
        if (!validateCSV(data)) {
            alert('Invalid file contents');
            return;
        }

        // Calculate consumption
        let peakConsumption = 0;
        let offPeakConsumption = 0;
        let incompleteRows = 0;
        let highestOffPeakConsumption = 0;
        let offPeakAccumulator = 0;
        let firstOffPeakRow = true;

        for (let rowNumber = 1; rowNumber < data.length; rowNumber++) {
            const row = data[rowNumber];
            if (row.length < 4) {
                incompleteRows++;
                continue; // Skip incomplete rows
            }

            const currentRowTime = new Date(row[2]);

            if (isOffPeak(OctopusNightStart, OctopusNightEnd, currentRowTime)) {
                offPeakConsumption += parseFloat(row[0]);

                if (firstOffPeakRow) {
                    offPeakAccumulator = 0;
                    firstOffPeakRow = false;
                } else {
                    offPeakAccumulator += parseFloat(row[0]);
                }
            } else {
                peakConsumption += parseFloat(row[0]);

                if (!firstOffPeakRow) {
                    firstOffPeakRow = true;
                    if (offPeakAccumulator > highestOffPeakConsumption) {
                        highestOffPeakConsumption = offPeakAccumulator;
                    }
                }
            }
        }

        // Debug
        console.log("Incomplete rows: " + incompleteRows);

        // calculate total price
        const numDays = calculateDaysBetween(data[1][2], data[data.length - 2][2]);
        const oldPrice = (peakConsumption * OctopusPeakRate + offPeakConsumption * OctopusOffPeakRate + OctopusStanding * numDays) / 100;
        const newPrice = (peakConsumption * NewPeakRate + offPeakConsumption * NewOffPeakRate + NewStanding * numDays) / 100;
        const averageOffPeakConsumption = offPeakConsumption / numDays;

        // Display results
        updateResult(oldPrice, newPrice, NewNightStart, NewNightEnd, highestOffPeakConsumption, averageOffPeakConsumption, setPriceCardData, setCapacityCardData);

        // Display chart
        const ctx = document.getElementById('consumptionPieChart') as HTMLCanvasElement;
        if (consumptionChart) { /* Destroy the existing chart if it exists*/
            consumptionChart.destroy()
        }
        consumptionChart = new Chart(ctx, generatePieChart(offPeakConsumption, peakConsumption));
    };
}

// Generate a chart config for displaying off-peak to peak ratio
export function generatePieChart(offPeak: number, peak: number): ChartConfiguration {

    const data = {
        labels: [
            'off-peak',
            'peak'
        ],
        datasets: [{
            label: 'kWh',
            data: [offPeak, peak],
            backgroundColor: [
                '#90CAF9',
                '#FFE082'
            ],
            hoverOffset: 4
        }]
    };
    const options = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1, // 1 means width = height
        plugins: {
            title: {
                display: true,
                text: 'Ratio of peak to off-peak consumption (kWh)',
                font: {
                    size: 20
                }
            }
        }
    };
    return {type: 'doughnut', data: data, options: options};
}


// Check if a Date object is in the off-peak period
export function isOffPeak(startTime: Date, endTime: Date, checkTime: Date): boolean {

    // normalize the times to the same day
    startTime.setFullYear(2000, 0, 1);
    endTime.setFullYear(2000, 0, 1);
    checkTime.setFullYear(2000, 0, 1);

    if (startTime.getTime() < endTime.getTime()) { // Case 1: Off-Peak period is within the same day
        return checkTime.getTime() >= startTime.getTime() && checkTime.getTime() < endTime.getTime();

    } else { // Case 2: Off-Peak period spans across two days
        return checkTime.getTime() >= startTime.getTime() || checkTime.getTime() < endTime.getTime();
    }
}


// Validate a CSV file to have all expected headers
export function validateCSV(data: string[][]) {
    const requiredHeaders = ["Consumption (kwh)", "Estimated Cost Inc. Tax (p)", "Start", "End"];
    const headers = data[0];
    return JSON.stringify(headers) === JSON.stringify(requiredHeaders);
}


// Get the number of off-peak hours between provided Dates
export function getNumberOffPeakHour(startTime: Date, endTime: Date): number {
    // Returns the number of hours between startTime and endTime.
    // startTime and endTime should both have the same value for year, month, and date.

    let totalDurationMinutes: number;

    if (startTime.getTime() < endTime.getTime()) { // Case 1: Off-Peak period is within the same day
        totalDurationMinutes = (endTime.getTime() - startTime.getTime()) / 1000 / 60;

    } else { // Case 2: Off-Peak period spans across two days
        const millisecondInDay = 24 * 60 * 60 * 1000;
        totalDurationMinutes = (endTime.getTime() - startTime.getTime() + millisecondInDay) / 1000 / 60;
    }
    return Math.floor(totalDurationMinutes / 30) / 2;
}


// Get the number of days between provided dates
export function calculateDaysBetween(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end.valueOf() - start.valueOf();
    return Math.ceil(timeDifference / (1000 * 3600 * 24));
}