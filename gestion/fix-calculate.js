// Script muy simple para sobrescribir calculateCosts
console.log('🔧 fix-calculate.js cargado');

// Esperar a que todo esté listo
window.addEventListener('load', () => {
    console.log('✅ Window load completado');

    // Esperar un poco más para asegurar que app.js se cargó
    setTimeout(() => {
        console.log('🎯 Instalando calculateCosts override...');

        // Guardar referencia original
        const originalFunction = window.calculateCosts;

        // Sobrescribir
        window.calculateCosts = function () {
            console.log('💰 calculateCosts ejecutado con override');
            console.log('📊 costsData:', window.costsData);

            if (!window.costsData) {
                console.error('❌ costsData NO está disponible');
                if (originalFunction) originalFunction();
                return;
            }

            const cd = window.costsData;
            const coffeeCostPerCapsule = cd.coffeeCost * cd.coffeeAmount;
            const baseCostWithoutBox = coffeeCostPerCapsule + cd.capsuleCost + cd.lidCost;

            // Calcular para cada caja
            const cost12 = baseCostWithoutBox + (cd.boxCost12 / 12);
            const cost24 = baseCostWithoutBox + (cd.boxCost24 / 24);
            const cost48 = baseCostWithoutBox + (cd.boxCost48 / 48);

            // Aplicar indirectos
            const rate = cd.indirectCosts / 100;
            const final12 = cost12 * (1 + rate);
            const final24 = cost24 * (1 + rate);
            const final48 = cost48 * (1 + rate);

            cd.costPerCapsule = final12;

            console.log('Costos calculados:', {
                final12: final12.toFixed(3),
                final24: final24.toFixed(3),
                final48: final48.toFixed(3)
            });

            // Actualizar DOM
            const elem1 = document.getElementById('costPerCapsule');
            const elem12 = document.getElementById('costBox12');
            const elem24 = document.getElementById('costBox24');
            const elem48 = document.getElementById('costBox48');

            if (elem1) {
                elem1.textContent = '$' + final12.toFixed(3);
                console.log('✅ Actualizado costPerCapsule');
            }

            if (elem12) {
                elem12.textContent = '$' + (final12 * 12).toFixed(2) + ' ($' + final12.toFixed(3) + '/cáp)';
                console.log('✅ Actualizado costBox12');
            }

            if (elem24) {
                elem24.textContent = '$' + (final24 * 24).toFixed(2) + ' ($' + final24.toFixed(3) + '/cáp)';
                console.log('✅ Actualizado costBox24');
            }

            if (elem48) {
                elem48.textContent = '$' + (final48 * 48).toFixed(2) + ' ($' + final48.toFixed(3) + '/cáp)';
                console.log('✅ Actualizado costBox48');
            }

            // Breakdown percentages
            const totalCost = coffeeCostPerCapsule + cd.capsuleCost + cd.lidCost;
            const coffeePercent = (coffeeCostPerCapsule / totalCost * 100).toFixed(1);
            const capsulePercent = (cd.capsuleCost / totalCost * 100).toFixed(1);
            const lidPercent = (cd.lidCost / totalCost * 100).toFixed(1);

            const bar1 = document.getElementById('coffeeBar');
            const bar2 = document.getElementById('capsuleBar');
            const bar3 = document.getElementById('lidBar');

            if (bar1) bar1.style.setProperty('--percentage', coffeePercent + '%');
            if (bar2) bar2.style.setProperty('--percentage', capsulePercent + '%');
            if (bar3) bar3.style.setProperty('--percentage', lidPercent + '%');

            const pct1 = document.getElementById('coffeePercent');
            const pct2 = document.getElementById('capsulePercent');
            const pct3 = document.getElementById('lidPercent');

            if (pct1) pct1.textContent = coffeePercent + '%';
            if (pct2) pct2.textContent = capsulePercent + '%';
            if (pct3) pct3.textContent = lidPercent + '%';

            // Recalculate profits
            if (window.salesData && window.salesData.priceBox12 > 0 && window.calculateProfits) {
                window.calculateProfits();
            }

            console.log('✅ calculateCosts completado');
        };

        console.log('✅ Override instalado correctamente');
    }, 500);
});
