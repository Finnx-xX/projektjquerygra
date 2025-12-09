$(document).ready(function () {

    const colors = ['red','blue','green','yellow','pink','orange','purple'];
    const balloonCount = 10;
    const objectsIcons = ['⭐','💎','🍎','🍀','🎁','🌟','🧸','⚽'];
    const bonusIcons = ['💫','👑','🪙'];
    const hazardIcons = ['💀','☠️','🔥'];
    const powerupTypes = [
        {icon:'⏰', effect:'addTime'},
        {icon:'⏱', effect:'subtractTime'},
        {icon:'⭐', effect:'doublePoints'},
        {icon:'💣', effect:'clearHazards'}
    ];
    
    let wynik = 0;
    let czas = 30;
    let combo = 1;
    let multiplier = 1;
    let gameOver = false;
    let comboTimeout, multiplierTimeout;
    let timerInterval;
    
    function playPop() {
        const s = $('#pop-sound')[0];
        s.currentTime = 0;
        s.play();
    }
    
    function createBalloons() {
        for (let i = 0; i < balloonCount; i++) {
            const isPoisoned = Math.random() < 0.15;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const elem = $('<div></div>');
    
            if (isPoisoned) {
                elem.addClass('poisoned');
                elem.css({ backgroundColor: '#228B22', border: '2px solid darkred', color: 'black' });
                elem.text('☠️');
            } else {
                elem.addClass('balloon');
                elem.css({ backgroundColor: color });
            }
    
            elem.css({
                left: Math.random() * (window.innerWidth - 50),
                top: window.innerHeight + Math.random() * 100
            });
    
            elem.data('vSpeed', 1 + Math.random() * 2);
            elem.data('hSpeed', (Math.random() * 1.5) - 0.75);
    
            $('body').append(elem);
        }
    }
    
    function spawnObject() {
        if (gameOver) return;
        const icon = objectsIcons[Math.floor(Math.random() * objectsIcons.length)];
        const o = $('<div class="object">' + icon + '</div>');
        o.css({ left: Math.random() * (window.innerWidth - 50), top: '-120px' });
        $('body').append(o);
    }
    
    function spawnBonus() {
        if (gameOver) return;
        const icon = bonusIcons[Math.floor(Math.random() * bonusIcons.length)];
        const b = $('<div class="bonus">' + icon + '</div>');
        b.css({ left: Math.random() * (window.innerWidth - 50), top: '-150px' });
        $('body').append(b);
    }
    
    function spawnHazard() {
        if (gameOver) return;
        const icon = hazardIcons[Math.floor(Math.random() * hazardIcons.length)];
        const h = $('<div class="hazard">' + icon + '</div>');
        h.css({ left: Math.random() * (window.innerWidth - 50), top: '-50px' });
        $('body').append(h);
    }
    
    function spawnPowerup() {
        if (gameOver) return;
        const p = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        const pow = $('<div class="powerup">' + p.icon + '</div>');
        pow.css({ left: Math.random() * (window.innerWidth - 50), top: '-100px' });
        pow.data('effect', p.effect);
        $('body').append(pow);
    }
    
    function startTimer() {
        timerInterval = setInterval(() => {
            if (gameOver) return;
            czas--;
            $('#timer').text('Czas: ' + czas);
            if (czas <= 0) endGame();
        }, 1000);
    }
    
    // --------------Combo pulse & color change animation-----------------------
    function updateCombo() {
        combo++;
        $('#combo').text('Combo: x' + combo);
    
        let color = 'green';
        if (combo >= 2 && combo < 5) color = 'yellow';
        else if (combo >= 5 && combo < 10) color = 'orange';
        else if (combo >= 10) color = 'red';
    
        // ------------------Pulse--------------------------
        $('#combo').stop(true).css('color', color)
                   .animate({ fontSize: '36px' }, 150)   // pulse bigger
                   .animate({ fontSize: '24px' }, 150);  // pulse back to normal
    
        clearTimeout(comboTimeout);
        comboTimeout = setTimeout(() => {
            combo = 1;
            $('#combo').text('Combo: x1');
            $('#combo').css('color', 'green');
        }, 1500);
    }
    
    function endGame() {
        gameOver = true;
        $('#game-over').html(`Koniec gry!<br>Wynik: ${wynik}<br><button id="restart-btn">Zresetuj grę</button>`).show();
    }
    
    function resetGame() {
        gameOver = false;
        wynik = 0;
        combo = 1;
        multiplier = 1;
        czas = 30;
        $('#score').text('Wynik: 0');
        $('#timer').text('Czas: 30');
        $('#combo').text('Combo: x1');
        $('#game-over').hide();
        $('body').find('.balloon, .poisoned, .object, .bonus, .hazard, .powerup').remove();
        createBalloons();
        clearInterval(spawnObjectInterval);
        clearInterval(spawnBonusInterval);
        clearInterval(spawnHazardInterval);
        clearInterval(spawnPowerupInterval);
        clearInterval(timerInterval);
        spawnObjectInterval = setInterval(spawnObject, 3000);
        spawnBonusInterval = setInterval(spawnBonus, 7000);
        spawnHazardInterval = setInterval(spawnHazard, 10000);
        spawnPowerupInterval = setInterval(spawnPowerup, 20000);
        startTimer();
    }
    
    $(document).on('click', '#restart-btn', resetGame);
    
    // ----------------------Fade animation function--------------------------
    function fadeRemove(elem, callback) {
        elem.animate({ opacity: 0, width: '-=10px', height: '-=10px' }, 250, callback);
    }
    
    // ------------------------Balloons fade on click-------------------------
    $(document).on('click', '.balloon', function () {
        if (gameOver) return;
        playPop();
        wynik += 1 * combo * multiplier;
        $('#score').text('Wynik: ' + wynik);
        updateCombo();
        let elem = $(this);
        fadeRemove(elem, () => {
            elem.css({
                opacity: 1,
                width: '50px',
                height: '70px',
                top: window.innerHeight + Math.random() * 100,
                left: Math.random() * (window.innerWidth - 50)
            });
        });
    });
    
    // -----------------Poisoned balloons fade on click----------------------------
    $(document).on('click', '.poisoned', function () {
        if (gameOver) return;
        playPop();
        wynik = Math.max(0, wynik - 5);
        $('#score').text('Wynik: ' + wynik);
        combo = 1;
        $('#combo').text('Combo: x1').css('color', 'green');
        let elem = $(this);
        fadeRemove(elem, () => {
            elem.css({
                opacity: 1,
                width: '50px',
                height: '70px',
                top: window.innerHeight + Math.random() * 100,
                left: Math.random() * (window.innerWidth - 50)
            });
        });
    });
    
    // -------------------------Objects and bonuses fade on click-----------------------------------------
    $(document).on('click', '.object, .bonus', function () {
        if (gameOver) return;
        playPop();
        let elem = $(this);
        const isBonus = elem.hasClass('bonus');
        wynik += isBonus ? 5 * combo * multiplier : 1 * combo * multiplier;
        $('#score').text('Wynik: ' + wynik);
        if (isBonus) updateCombo();
        fadeRemove(elem, () => elem.remove());
    });
    
    // -------------------------------Hazards slideUp on click-------------------------------------------
    $(document).on('click', '.hazard', function () {
        if (gameOver) return;
        playPop();
        wynik = Math.max(0, wynik - 5);
        czas = Math.max(0, czas - 3);
        $('#score').text('Wynik: ' + wynik);
        $('#timer').text('Czas: ' + czas);
        combo = 1;
        $('#combo').text('Combo: x1').css('color', 'green');
        $(this).slideUp(200, function () {
            $(this).remove();
        });
    });
    
    // Powerups fade on click
    $(document).on('click', '.powerup', function () {
        if (gameOver) return;
        playPop();
        let elem = $(this);
        let effect = elem.data('effect');
        switch (effect) {
            case 'addTime': czas += 5; break;
            case 'subtractTime': czas = Math.max(0, czas - 5); break;
            case 'doublePoints':
                multiplier = 2;
                clearTimeout(multiplierTimeout);
                multiplierTimeout = setTimeout(() => multiplier = 1, 5000);
                break;
            case 'clearHazards': $('.hazard').slideUp(300, function () { $(this).remove(); }); break;
        }
        $('#timer').text('Czas: ' + czas);
        fadeRemove(elem, () => elem.remove());
    });
    
    // Animation loop
    function animateElements() {
        if (gameOver) return;
    
        $('.balloon, .poisoned').each(function () {
            const t = parseFloat($(this).css('top'));
            const l = parseFloat($(this).css('left'));
            const v = $(this).data('vSpeed');
            const h = $(this).data('hSpeed');
            let newTop = t - v;
            let newLeft = l + h;
            if (newLeft < 0) newLeft = 0;
            if (newLeft > window.innerWidth - 50) newLeft = window.innerWidth - 50;
            if (newTop < -100) {
                newTop = window.innerHeight + Math.random() * 50;
                newLeft = Math.random() * (window.innerWidth - 50);
            }
            $(this).css({ top: newTop, left: newLeft });
        });
    
        $('.object, .bonus').each(function () {
            const t = parseFloat($(this).css('top'));
            let speed = 1 + Math.random() * 1.2;
            if ($(this).hasClass('bonus')) speed *= 1.2;
            let newTop = t + speed;
            if (newTop > window.innerHeight) $(this).remove();
            else $(this).css('top', newTop);
        });
    
        $('.hazard').each(function () {
            const t = parseFloat($(this).css('top'));
            const speed = 0.8 + Math.random() * 0.7;
            const newTop = t + speed;
            if (newTop > window.innerHeight) $(this).remove();
            else $(this).css('top', newTop);
        });
    
        $('.powerup').each(function () {
            const t = parseFloat($(this).css('top'));
            const speed = 1 + Math.random() * 1.5;
            let newTop = t + speed;
            if (newTop > window.innerHeight) $(this).remove();
            else $(this).css('top', newTop);
        });
    }
    
    setInterval(animateElements, 20);
    
    createBalloons();
    startTimer();
    
    let spawnObjectInterval = setInterval(spawnObject, 3000);
    let spawnBonusInterval = setInterval(spawnBonus, 7000);
    let spawnHazardInterval = setInterval(spawnHazard, 10000);
    let spawnPowerupInterval = setInterval(spawnPowerup, 20000);
    
    });
    