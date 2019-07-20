const tau = 0.5 // 0.3 .. 1.2

// glicko(player, [ [1/*win*/, opponent1], [0/*lost*/, opponent2], [0.5/*draw*/, opponent3] ... ])
function glicko(player, opponents) {
	console.log("glicko(%o, %f, %o)", player, opponents)

	let sq = (v) => { return v*v }
	let g = (phi) => {
		return 1 / Math.sqrt(
			1 + 3*sq(phi) / sq(Math.PI)
		)
	}
	let E = (prating, orating, og) => {
		return 1 / (1 + Math.exp(-og*(prating - orating)))
	}

	let phi = player.phi
	let phi2 = sq(phi)
	let rho = player.rho
	let rho2 = sq(rho)

	let vsum = 0
	let dsum = 0
	opponents.forEach(o => {
		let score = o[0]
		let opponent = o[1]
		let og = g(opponent.phi)
		let oe = E(player.rating, opponent.rating, og)
		console.debug("glicko s3: %o [%f] => g: %f, E: %f", opponent, score, og, oe)
		vsum += sq(og) * oe * (1-oe)
		dsum += og*(score-oe)
	})
	let v = 1/vsum
	let delta = v * dsum
	let delta2 = sq(delta)
	console.debug("glicko s4: v: %f, delta: %f", v, delta)

	let alpha = Math.log(rho2)

	let f = (x) => {
		const ex = Math.exp(x)
		return (ex * ( sq(delta) - phi2 - v - ex)) / 
			(2* (phi2 + v +  ex) ) -
			(x - alpha) / sq(tau)
	}
	const epsilon = 0.000001

	let A = alpha
	let B
	if (delta2 > phi2 + v) B = Math.log(delta2 - phi2 - v)
	else {
		let k = 1
		for (;;) {
			B = alpha - k*tau
			console.debug("glicko s5: refining k: %d", k)
			if (f(B) < 0) k = k+1
			else break
		}
	}
	console.debug("glicko s5: A: %f, B: %f", A, B)
	
	let fa = f(A)
	let fb = f(B)
	for (;Math.abs(B-A) > epsilon;) {
		console.debug("glicko s5: narrowing |%f - %f| = %f...", B, A, Math.abs(B-A))
		let C = A + (A-B)*fa/(fb-fa)
		let fc = f(C)
		console.debug("glicko s5: C: %f, fc: %f", C, fc)
		if (fc*fb<0) {
			A = B
			fa = fb
		} else {
			fa = fa/2
		}
		B = C
		fb = fc
	}
	console.debug("glicko s5: A: %f, B: %f", A, B)

	let out = {}
	for (var attr in player) {
        	if (player.hasOwnProperty(attr)) out[attr] = player[attr]
    	}

	out.rho = Math.exp(A/2)
	if (out.rho>1) {
		throw("rho! %f", out.rho)
	}
	let newRho2 = sq(out.rho)

	let phiStar = Math.sqrt(phi2 + newRho2)

	out.phi = 1 / Math.sqrt(1/sq(phiStar)+1/v)
	let newPhi2 = sq(out.phi)
	
	out.rating = player.rating + newPhi2 * dsum

	console.log("glicko out: %o", out)
	return out
}
