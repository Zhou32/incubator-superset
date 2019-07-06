/**
 * @Package: Ultra Admin HTML Theme
 * @Since: Ultra 1.0
 * This file is part of Ultra Admin Theme HTML package.
 */


jQuery(function($) {

    'use strict';

    var ULTRA_SETTINGS = window.ULTRA_SETTINGS || {};

    ULTRA_SETTINGS.chartJS = function() {

        /* Donut Chart*/

        var eventData = [{
                value: 14,
                color: "#1F78B4",
                highlight: "rgba(250,133,100,0.8)",
                label: "Orange"
            }, {
                value: 7,
                color: "#A6CEE3",
                highlight: "rgba(31,181,172,0.8)",
                label: "Primary"
            }, {
                value: 1,
                color: "#B2DF8A",
                highlight: "#FFC870",
                label: "Yellow"
            }

        ];

        var ctxd = document.getElementById("event-chart").getContext("2d");
        window.myDoughnut = new Chart(ctxd).Doughnut(eventData, {
            responsive: true
        });

        var warningData = [{
                value: 14,
                color: "#DAD338",
                highlight: "rgba(250,133,100,0.8)",
                label: "Warnings"
            }, {
                value: 7,
                color: "#A6CEE3",
                highlight: "rgba(31,181,172,0.8)",
                label: "Events"
            }, {
                value: 1,
                color: "#B2DF8A",
                highlight: "#FFC870",
                label: "Issues"
            }

        ];

        var ctxd = document.getElementById("warning-chart").getContext("2d");
        window.myDoughnut = new Chart(ctxd).Doughnut(warningData, {
            responsive: true
        });


        var issueData = [{
                value: 14,
                color: "#FF1B51",
                highlight: "rgba(250,133,100,0.8)",
                label: "Issues"
            }, {
                value: 7,
                color: "#A6CEE3",
                highlight: "rgba(31,181,172,0.8)",
                label: "Events"
            }, {
                value: 1,
                color: "#B2DF8A",
                highlight: "#FFC870",
                label: "Warnings"
            }

        ];

        var ctxd = document.getElementById("issue-chart").getContext("2d");
        window.myDoughnut = new Chart(ctxd).Doughnut(issueData, {
            responsive: true
        });
    };






    /******************************
     initialize respective scripts 
     *****************************/
    $(document).ready(function() {});

    $(window).resize(function() {});

    $(window).load(function() {
        ULTRA_SETTINGS.chartJS();
    });

});
