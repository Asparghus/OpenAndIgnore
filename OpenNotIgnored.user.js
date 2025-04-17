// ==UserScript==
// @name         Open Links in New Tabs (With Filtering)
// @namespace    https://gazellegames.net/
// @version      1.1
// @description  Opens links in new tabs with a specific format, filtering by parent class.
// @include      https://gazellegames.net/torrents.php*
// @exclude      https://gazellegames.net/torrents.php?id*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create the "Open Links" button
    const button = document.createElement('button');
    button.textContent = 'Open Links';
    button.className = 'link-style-button';  // Use the same class for link-style

    // Add the button to the same location as the previous userscript
    const alertBar = document.querySelector(".alertbar.blend");
    const clearCacheLink = document.getElementById("clearcache");

    if (alertBar && clearCacheLink) {
        clearCacheLink.insertAdjacentElement("afterend", button);
    }

    // Function to open links with the title attribute set to "View Torrent" that are not grandchildren of tr with class "ignored."
    button.addEventListener('click', () => {
        const links = [];
        const allLinks = document.querySelectorAll('a[title="View Torrent"]');

        allLinks.forEach((link) => {
            let isGrandchildOfIgnored = false;
            let parent = link.parentElement;

            // Check if the link's ancestors include a tr with class "ignored."
            while (parent) {
                if (parent.classList.contains('ignored')) {
                    isGrandchildOfIgnored = true;
                    break;
                }
                parent = parent.parentElement;
            }

            if (!isGrandchildOfIgnored) {
                links.push(link);
            }
        });

        // Open tabs for all relevant links in the background without switching to them.
        links.forEach((link) => {
            const url = link.getAttribute('href');
            const newTab = window.open(url, '_blank');
            newTab.blur(setTimeout(100)); // Keeps the focus on the original tab
        });
    });

    // Add custom CSS styles to make the button look like a link
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
