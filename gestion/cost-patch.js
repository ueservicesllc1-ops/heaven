// Patch simple y directo para calculateCosts
(function () {
    'use strict';

    let attempts = 0;
    const maxAttempts = 10;

    function tryPatch() {
        attempts++;

        if (window.costsData) {
            console.log('✅ costsData encontrado, instalando patch...');
            installPatch();
        } else if (attempts < maxAttempts) {
            setTimeout(tryPatch, 200);
        }
    }

    function installPatch() {
        // Reemplazar calculateCosts
        window.calculateCosts = function () {
            const cd = window.costsData;
            const coffeeCostPerCapsule = cd.coffeeCost * cd.coffeeAmount;
            const baseCostWithoutBox = coffeeCostPerCapsule + cd.capsuleCost + cd.lidCost;

            const costPerCapsul12 = baseCostWithoutBox + (cd.boxCost12 / 12);
            const costPerCapsul24 = baseCostWithoutBox + (cd.boxCost24 / 24);
            const costPerCapsul48 = baseCostWithoutBox + (cd.boxCost48 / 48);

            const indirectRate = cd.indirectCosts / 100;
            const finalCost12 = costPerCapsul12 * (1 + indirectRate);
            const finalCost24 = costPerCapsul24 * (1 + indirectRate);
            const finalCost48 = costPerCapsul48 * (1 + indirectRate);

            cd.costPerCapsule = finalCost12;

            const costBox12 = finalCost12 * 12;
            const costBox24 = finalCost24 * 24;
            const costBox48 = finalCost48 * 48;

            document.getElementById('costPerCapsule').textContent = '$' + finalCost12.toFixed(3);
            document.getElementById('costBox12').textContent = '$' + costBox12.toFixed(2) + ' ($' + finalCost12.toFixed(3) + '/cáp)';
            document.getElementById('costBox24').textContent = '$' + costBox24.toFixed(2) + ' ($' + finalCost24.toFixed(3) + '/cáp)';
            document.getElementById('costBox48').textContent = '$' + costBox48.toFixed(2) + ' ($' + finalCost48.toFixed(3) + '/cáp)';

            const totalCost = coffeeCostPerCapsule + cd.capsuleCost + cd.lidCost;
            const coffeePercent = (coffeeCostPerCapsule / totalCost * 100).toFixed(1);
            const capsulePercent = (cd.capsuleCost / totalCost * 100).toFixed(1);
            const lidPercent = (cd.lidCost / totalCost * 100).toFixed(1);

            document.getElementById('coffeeBar').style.setProperty('--percentage', coffeePercent + '%');
            document.getElementById('capsuleBar').style.setProperty('--percentage', capsulePercent + '%');
            document.getElementById('lidBar').style.setProperty('--percentage', lidPercent + '%');

            document.getElementById('coffeePercent').textContent = coffeePercent + '%';
            document.getElementById('capsulePercent').textContent = capsulePercent + '%';
            document.getElementById('lidPercent').textContent = lidPercent + '%';

            if (window.salesData && window.salesData.priceBox12 > 0 && window.calculateProfits) {
                window.calculateProfits();
            }
        };

        console.log('✅ Patch instalado - calculateCosts reemplazado');
    }

    tryPatch();
})();
