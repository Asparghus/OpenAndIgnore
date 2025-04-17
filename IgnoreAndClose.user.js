// ==UserScript==
// @name         GGn - Ignore Game and Close Tab
// @namespace    https://gazellegames.net/
// @version      1.9
// @description  Add two link-style buttons to the alert bar: one to ignore torrent and close tab, another to just close tab
// @author       GeneX
// @match        https://gazellegames.net/torrents.php?id=*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("UserScript loaded");

    // Extract the ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get("id");
    console.log("Torrent ID:", idParam);

    // Function to wait for the target node to appear before checking style changes
    function waitForTargetNode(callback, retries = 20, interval = 500) {
        let attempts = 0;

        function checkForNode() {
            const targetNode = document.evaluate("/html/body/div[1]/div[3]/div[1]/h2/s", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (targetNode) {
                console.log("Target node found", targetNode);
                callback(targetNode);
            } else if (attempts < retries) {
                attempts++;
                console.log("Waiting for target node... Attempt", attempts);
                setTimeout(checkForNode, interval);
            } else {
                console.warn("Target node not found after maximum attempts");
            }
        }
        checkForNode();
    }

    // Function to check style changes and retry if needed
    function checkStyleAndRetry(targetNode, callback, retries = 10, interval = 2000) {
        let attempts = 0;

        function check() {
            const computedStyle = window.getComputedStyle(targetNode);
            console.log(`Check ${attempts + 1}: text-decoration = ${computedStyle.textDecoration}, display = ${computedStyle.display}`);

            if (computedStyle.textDecoration.includes("line-through") && computedStyle.display === "inline-block") {
                console.log("Style matched. Closing tab.");
                callback();
            } else if (attempts < retries) {
                attempts++;
                console.log("Retrying Ignore function...");
                Ignore(idParam, '[Un-Ignore]');
                setTimeout(check, interval);
            } else {
                console.warn("Max retries reached. Closing tab anyway.");
                window.close();
            }
        }

        // Use a MutationObserver to detect changes immediately
        const observer = new MutationObserver(() => {
            const computedStyle = window.getComputedStyle(targetNode);
            console.log(`Mutation detected: text-decoration = ${computedStyle.textDecoration}, display = ${computedStyle.display}`);
            if (computedStyle.textDecoration.includes("line-through") && computedStyle.display === "inline-block") {
                console.log("MutationObserver: Style matched. Closing tab.");
                observer.disconnect();
                callback();
            }
        });
        observer.observe(targetNode, { attributes: true, attributeFilter: ["style"] });

        check();
    }

    // Create the "Ignore Torrent" button
    const ignoreButton = document.createElement("button");
    ignoreButton.textContent = "Ignore Torrent";
    ignoreButton.className = "link-style-button";

    ignoreButton.onclick = function(event) {
        event.preventDefault();
        console.log("Ignore button clicked");
        Ignore(idParam, '[Un-Ignore]');

        // Wait for the target node, then check its style
        waitForTargetNode((targetNode) => {
            checkStyleAndRetry(targetNode, () => {
                console.log("Final closure - closing tab");
                window.close();
            });
        });
    };

    // Create the "Close Tab" button
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close Tab";
    closeButton.className = "link-style-button";

    closeButton.onclick = function(event) {
        event.preventDefault();
        console.log("Close button clicked. Closing tab.");
        window.close();
    };

    // Find the alert bar and insert both buttons after the 'clearcache' link
    const alertBar = document.querySelector(".alertbar.blend");
    const clearCacheLink = document.getElementById("clearcache");

    if (alertBar && clearCacheLink) {
        console.log("Inserting buttons into the page");
        clearCacheLink.insertAdjacentElement("afterend", closeButton);
        clearCacheLink.insertAdjacentElement("afterend", ignoreButton);
    } else {
        console.warn("Alert bar or clearcache link not found");
    }

    // Add custom CSS styles to make the buttons look like links
    const style = document.createElement("style");
    style.textContent = `
        .link-style-button {
            background: none;
            border: none;
            color: var(--lightBlue);
            cursor: pointer;
            vertical-align: baseline;
        }
        .link-style-button:hover {
            color: white;
            text-decoration: underline;
        }
    `;
    document.head.appendChild(style);
})();
