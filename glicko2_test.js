function testGlicko2() {
	expect = (e, g) => {
		if (Math.abs(g-e)>0.001) throw(`expected ${e}, got: ${g}`)
	}
	let out = glicko({rating: 0, phi: 1.1513, rho: 0.06}, [
			[1, {rating: -0.5756, phi: 0.1727}],
			[0, {rating:  0.2878, phi: 0.5756}],
			[0, {rating:  1.1513, phi: 1.7269}],
		])
	expect(0.8722, out.phi)
	expect(-0.2069, out.rating)
}
