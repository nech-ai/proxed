type IconProps = React.HTMLAttributes<SVGElement>;

export const Icons = {
	logo: (props: IconProps) => (
		<svg
			className="group size-9 text-primary dark:invert"
			viewBox="0 0 1024 1024"
		>
			<path
				id="Background"
				fill="#FFFFFF"
				fillRule="evenodd"
				stroke="none"
				d="M 595.173706 770.803223 C 594.115234 770.969971 592.477783 770.3349 591.53479 769.391968 C 590.397766 768.254883 589.971252 766.64917 590.268433 764.62439 C 590.582764 762.482544 592.287048 760.217407 595.978149 757.035645 C 598.87207 754.541016 616.823364 736.931274 635.869873 717.902832 C 654.916443 698.87439 677.25 676.211304 685.5 667.540405 C 693.75 658.869507 700.623535 651.263184 700.774414 650.637573 C 700.978638 649.790894 650.924316 649.452026 505.040466 649.312256 C 345.079895 649.159058 308.523346 648.881836 306.266022 647.804871 C 304.441162 646.934204 303.394379 645.573364 303.189606 643.805237 C 302.964111 641.858032 303.547852 640.687134 305.324402 639.523071 C 307.547821 638.066284 325.60025 637.931946 504.384735 638.042236 C 612.523071 638.109009 701.074158 637.827393 701.164917 637.416443 C 701.255737 637.005493 692.426575 627.572815 681.544617 616.454895 C 670.662659 605.336975 653.7677 588.198853 644.000244 578.370239 C 634.232788 568.541626 618.265381 552.849976 608.516968 543.5 C 595.972107 531.467712 590.64093 525.686157 590.273071 523.714966 C 589.925781 521.853699 590.356506 520.26355 591.571533 518.920898 C 592.571533 517.81604 594.214722 517.044312 595.223022 517.205994 C 596.231445 517.367676 606.232788 526.5 617.448242 537.5 C 628.663696 548.5 642.425354 561.775024 648.029663 567 C 653.633911 572.224976 669.356812 588.148621 682.96936 602.385803 C 696.58197 616.622986 710.595154 631.390503 714.109741 635.202515 C 718.170715 639.607056 720.610046 643.146606 720.80188 644.913025 C 721.070129 647.382568 716.258301 652.53363 677.659607 691.096313 C 653.76532 714.968384 625.864014 742.599976 615.656738 752.5 C 605.449463 762.400024 596.232056 770.636475 595.173706 770.803223 Z M 427.688843 507 C 425.013306 507 421.874786 504.195923 403.061279 484.997192 C 391.202576 472.89563 380.293091 461.308105 378.817993 459.247192 C 377.342896 457.186218 362.031952 441.549988 344.793701 424.5 C 327.55545 407.450012 311.498138 391.968628 309.110779 390.097046 C 306.723419 388.225403 304.140808 385.187866 303.371643 383.347046 C 302.172943 380.478149 302.173676 379.535767 303.376831 376.75 C 304.156219 374.945435 314.133209 364.38269 325.809875 353 C 337.376007 341.724976 351.147766 328.450012 356.413757 323.5 C 361.679779 318.549988 379.667206 300.826477 396.385864 284.11438 C 424.020905 256.490234 427.019043 253.787964 429.376465 254.379639 C 431.0177 254.791565 432.199127 255.94519 432.595001 257.522522 C 432.977448 259.046265 432.619049 260.932434 431.672607 262.376892 C 430.821289 263.676147 417.834198 277.236572 402.812378 292.511108 C 387.790588 307.785645 366.5 328.75415 355.5 339.107666 C 344.5 349.461243 332.0047 361.186646 327.732635 365.164063 C 323.460571 369.141479 320.106659 372.820007 320.27951 373.338501 C 320.475189 373.925537 394.994263 374.203369 517.773438 374.074829 C 680.055359 373.904907 715.44397 374.103638 717.726563 375.197632 C 719.966614 376.271301 720.5 377.191772 720.5 379.983948 C 720.5 382.66748 719.940674 383.723877 718 384.705688 C 716.01001 385.712524 675.452026 385.973511 519.176697 385.985229 C 355.65686 385.997559 322.907379 386.223755 323.176666 387.339172 C 323.354492 388.075684 325.524994 391.085693 328 394.028015 C 330.475006 396.970337 355 422.008606 382.5 449.668701 C 410 477.328735 432.647034 500.893494 432.826782 502.034912 C 433.00647 503.17627 432.613892 504.760315 431.954315 505.555054 C 431.294739 506.349731 429.375305 507 427.688843 507 Z"
			/>
			<path
				id="Arrows"
				fill="#000000"
				fillRule="evenodd"
				stroke="none"
				d="M 510.289429 943.870239 C 376.755249 943.798889 264.125 943.355347 260 942.884521 C 255.875 942.413696 247.595016 941.095581 241.600052 939.955322 C 235.605072 938.815125 225.453903 936.159546 219.041885 934.054016 C 212.629883 931.948486 202.471619 927.908813 196.467987 925.076904 C 190.464355 922.244995 182.165527 917.846741 178.026138 915.30304 C 173.886765 912.759399 167.125107 908.163086 163.000244 905.089111 C 158.875366 902.015076 154.215118 898.24939 152.644119 896.720825 C 151.07312 895.192261 148.512314 893.282043 146.953445 892.475952 C 145.394562 891.6698 143.316025 889.650696 142.334457 887.989014 C 141.35289 886.327393 138.863632 883.85199 136.80278 882.488159 C 134.741928 881.12439 132.381363 878.704346 131.557083 877.110352 C 130.732803 875.516418 128.807755 872.92688 127.279198 871.355896 C 125.750641 869.784912 121.984917 865.124634 118.910919 860.999756 C 115.836922 856.874878 111.240631 850.11322 108.696938 845.973877 C 106.153244 841.834473 101.78746 833.604431 98.995201 827.684814 C 96.202942 821.765259 92.301155 812.10199 90.324562 806.210938 C 88.347969 800.319946 85.670219 790.325012 84.374008 784 C 83.077789 777.674988 81.519058 766.650024 80.910141 759.5 C 80.124878 750.279236 79.918762 675.566772 80.201134 502.5 C 80.599236 258.5 80.599236 258.5 82.896515 246.5 C 84.160027 239.900024 86.72863 229.431213 88.604538 223.236084 C 90.480446 217.040894 94.006874 207.446777 96.441048 201.915771 C 98.875221 196.384827 103.16346 187.713806 105.970459 182.646851 C 108.777466 177.579834 113.758659 169.848938 117.039787 165.467102 C 120.320908 161.085205 124.595749 155.679382 126.539421 153.454224 C 128.483093 151.229065 130.883453 148.079102 131.873535 146.454224 C 132.863632 144.829407 134.857452 142.869324 136.304245 142.09845 C 137.751038 141.327637 140.07254 138.977661 141.46312 136.876343 C 142.853714 134.775024 145.295639 132.381348 146.889618 131.557068 C 148.483597 130.732788 151.07312 128.807739 152.644119 127.279175 C 154.215118 125.75061 158.875366 121.984924 163.000244 118.910889 C 167.125107 115.836914 173.886765 111.240662 178.026138 108.69696 C 182.165527 106.153259 190.464355 101.755005 196.467987 98.923096 C 202.471619 96.091187 212.609482 92.058228 218.996567 89.960876 C 225.383652 87.863525 235.30983 85.246094 241.054733 84.144348 C 246.799622 83.042603 255.869766 81.659363 261.210571 81.070557 C 267.840607 80.3396 347.400452 80 512 80 C 676.599548 80 756.159363 80.3396 762.789429 81.070557 C 768.130249 81.659363 777.200378 83.042603 782.945251 84.144348 C 788.690186 85.246094 798.616333 87.863525 805.003418 89.960876 C 811.390503 92.058228 821.528381 96.091187 827.532043 98.923096 C 833.535645 101.755005 841.834473 106.153259 845.973877 108.69696 C 850.11322 111.240662 856.874878 115.836914 860.999756 118.910889 C 865.124634 121.984924 869.784912 125.75061 871.355896 127.279175 C 872.92688 128.807739 875.501587 130.725159 877.077454 131.540039 C 878.65332 132.35498 881.051819 134.653931 882.40741 136.648926 C 883.763062 138.643921 886.07489 141.065125 887.5448 142.029358 C 889.014709 142.993652 891.035828 145.030212 892.036133 146.555054 C 893.036438 148.079956 895.461304 151.166321 897.424683 153.413757 C 899.388123 155.661194 903.679077 161.085205 906.960205 165.467102 C 910.241333 169.848938 915.222534 177.579834 918.029541 182.646851 C 920.836548 187.713806 925.124756 196.384827 927.55896 201.915771 C 929.993103 207.446777 933.519531 217.040894 935.395447 223.236084 C 937.271362 229.431213 939.839966 239.900024 941.103455 246.5 C 943.400757 258.5 943.400757 258.5 943.798889 502.5 C 944.081238 675.566772 943.875122 750.279236 943.089844 759.5 C 942.480957 766.650024 940.92218 777.674988 939.625977 784 C 938.329773 790.325012 935.652039 800.319946 933.675415 806.210938 C 931.698853 812.10199 927.797058 821.765259 925.004822 827.684814 C 922.212524 833.604431 917.846741 841.834473 915.30304 845.973877 C 912.759338 850.11322 908.163086 856.874878 905.089111 860.999756 C 902.015076 865.124634 898.24939 869.784912 896.720825 871.355896 C 895.192261 872.92688 893.267212 875.516418 892.442932 877.110352 C 891.618652 878.704346 889.258057 881.12439 887.197205 882.488159 C 885.136353 883.85199 882.647095 886.327393 881.665527 887.989014 C 880.68396 889.650696 878.605408 891.6698 877.04657 892.475952 C 875.487671 893.282043 872.92688 895.192261 871.355896 896.720825 C 869.784912 898.24939 865.124634 902.015076 860.999756 905.089111 C 856.874878 908.163086 850.11322 912.759399 845.973877 915.30304 C 841.834473 917.846741 833.535645 922.244995 827.532043 925.076904 C 821.528381 927.908813 811.390503 931.941772 805.003418 934.039124 C 798.616333 936.136475 788.690186 938.753906 782.945251 939.855652 C 777.200378 940.957397 768.130249 942.340637 762.789429 942.929443 C 756.123779 943.664307 676.946594 943.959351 510.289429 943.870239 Z M 599.45343 771.391602 C 600.527771 771.220703 614.842896 757.675171 631.264771 741.290405 C 647.686646 724.905701 674.707581 697.599487 691.31134 680.609924 C 720.680359 650.558594 721.509583 649.600525 721.853394 645.325684 C 722.206848 640.931519 722.206848 640.931519 709.565552 627.715759 C 702.612793 620.447083 687.97583 605.049988 677.03894 593.5 C 666.10199 581.950012 644.541443 559.925415 629.126587 544.556519 C 601.099609 516.612915 601.099609 516.612915 596.532715 516.45874 C 594.020874 516.373901 591.261475 516.81958 590.400635 517.448975 C 589.092834 518.405273 588.995667 519.474487 589.80957 523.952698 C 590.783691 529.311951 590.783691 529.311951 644.125366 582.606567 C 673.463318 611.918579 697.624451 636.373413 697.816895 636.950562 C 698.009277 637.527771 697.454102 638.036133 696.583191 638.080261 C 695.71228 638.12439 607.812256 638.084351 501.249847 637.991211 C 394.687439 637.898071 306.375 638.207581 305 638.679016 C 303.124695 639.321899 302.420471 640.359985 302.181763 642.833374 C 302.006744 644.646851 302.399353 646.776245 303.054199 647.565308 C 304.080933 648.80249 330.974731 649.001892 498.372437 649.013672 C 605.142578 649.021179 693.537964 649.305298 694.80658 649.645081 C 696.403931 650.072876 696.929016 650.760498 696.514282 651.881409 C 696.184875 652.771606 672.260315 677.17572 643.348511 706.112671 C 594.009216 755.494995 590.730164 758.994751 589.942322 763.112671 C 589.480652 765.525696 589.326904 768.261658 589.600647 769.192566 C 589.919312 770.276428 591.42926 771.032104 593.799133 771.293701 C 595.834595 771.518433 598.379028 771.5625 599.45343 771.391602 Z M 429.127563 507.943542 C 430.572723 507.974609 432.310181 507.331177 432.988556 506.513794 C 433.668274 505.694763 434.036346 503.437134 433.808441 501.484985 C 433.448059 498.397888 429.849579 494.329468 405.823639 469.845337 C 390.659454 454.391907 367.283112 430.568848 353.87619 416.90509 C 340.469299 403.241394 328.630127 390.930359 327.566956 389.547363 C 326.503815 388.164307 325.919464 386.747192 326.268433 386.398254 C 326.617401 386.049255 414.949219 385.841919 522.56134 385.937439 C 705.923706 386.10022 718.338501 386.003601 720.109863 384.400574 C 721.33905 383.288147 722 381.34552 722 378.845032 C 722 376.730286 721.549988 374.997742 721 374.994995 C 720.450012 374.992249 631.372498 374.879761 523.049988 374.744995 C 363.871765 374.546997 325.852722 374.252747 324.810638 373.210632 C 323.758148 372.158142 326.026215 369.494263 337.156097 358.710632 C 344.655243 351.444763 355.225433 341.556946 360.645447 336.737671 C 366.06546 331.918396 383.774994 314.469543 400 297.962463 C 416.225006 281.455444 430.299255 266.937927 431.276093 265.701355 C 432.25296 264.464844 433.311646 261.854492 433.628693 259.900574 C 434.045746 257.33075 433.742126 255.88501 432.531158 254.674011 C 431.610443 253.753296 429.380829 253 427.576447 253 C 425.772064 253 422.847168 254.012512 421.07666 255.25 C 419.306152 256.487488 393.99704 281.349976 364.834198 310.5 C 335.671356 339.650024 309.583191 366.135193 306.860474 369.355957 C 302.029114 375.071045 301.917145 375.351318 302.205048 381.007935 C 302.5 386.803955 302.5 386.803955 361.434631 446.151978 C 396.865326 481.831238 421.591766 505.976013 423.434631 506.693542 C 425.120575 507.350037 427.682404 507.912537 429.127563 507.943542 Z"
			/>
		</svg>
	),
	twitter: (props: IconProps) => (
		<svg
			height="23"
			viewBox="0 0 1200 1227"
			width="23"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				fill="currentColor"
				d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
			/>
		</svg>
	),
	github: (props: IconProps) => (
		<svg viewBox="0 0 438.549 438.549" {...props}>
			<path
				fill="currentColor"
				d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
			/>
		</svg>
	),
	aria: (props: IconProps) => (
		<svg role="img" viewBox="0 0 24 24" fill="currentColor" {...props}>
			<path d="M13.966 22.624l-1.69-4.281H8.122l3.892-9.144 5.662 13.425zM8.884 1.376H0v21.248zm15.116 0h-8.884L24 22.624Z" />
		</svg>
	),
	npm: (props: IconProps) => (
		<svg viewBox="0 0 24 24" {...props}>
			<path
				d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"
				fill="currentColor"
			/>
		</svg>
	),
	yarn: (props: IconProps) => (
		<svg viewBox="0 0 24 24" {...props}>
			<path
				d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm.768 4.105c.183 0 .363.053.525.157.125.083.287.185.755 1.154.31-.088.468-.042.551-.019.204.056.366.19.463.375.477.917.542 2.553.334 3.605-.241 1.232-.755 2.029-1.131 2.576.324.329.778.899 1.117 1.825.278.774.31 1.478.273 2.015a5.51 5.51 0 0 0 .602-.329c.593-.366 1.487-.917 2.553-.931.714-.009 1.269.445 1.353 1.103a1.23 1.23 0 0 1-.945 1.362c-.649.158-.95.278-1.821.843-1.232.797-2.539 1.242-3.012 1.39a1.686 1.686 0 0 1-.704.343c-.737.181-3.266.315-3.466.315h-.046c-.783 0-1.214-.241-1.45-.491-.658.329-1.51.19-2.122-.134a1.078 1.078 0 0 1-.58-1.153 1.243 1.243 0 0 1-.153-.195c-.162-.25-.528-.936-.454-1.946.056-.723.556-1.367.88-1.71a5.522 5.522 0 0 1 .408-2.256c.306-.727.885-1.348 1.32-1.737-.32-.537-.644-1.367-.329-2.21.227-.602.412-.936.82-1.08h-.005c.199-.074.389-.153.486-.259a3.418 3.418 0 0 1 2.298-1.103c.037-.093.079-.185.125-.283.31-.658.639-1.029 1.024-1.168a.94.94 0 0 1 .328-.06zm.006.7c-.507.016-1.001 1.519-1.001 1.519s-1.27-.204-2.266.871c-.199.218-.468.334-.746.44-.079.028-.176.023-.417.672-.371.991.625 2.094.625 2.094s-1.186.839-1.626 1.881c-.486 1.144-.338 2.261-.338 2.261s-.843.732-.899 1.487c-.051.663.139 1.2.343 1.515.227.343.51.176.51.176s-.561.653-.037.931c.477.25 1.283.394 1.71-.037.31-.31.371-1.001.486-1.283.028-.065.12.111.209.199.097.093.264.195.264.195s-.755.324-.445 1.066c.102.246.468.403 1.066.398.222-.005 2.664-.139 3.313-.296.375-.088.505-.283.505-.283s1.566-.431 2.998-1.357c.917-.598 1.293-.76 2.034-.936.612-.148.57-1.098-.241-1.084-.839.009-1.575.44-2.196.825-1.163.718-1.742.672-1.742.672l-.018-.032c-.079-.13.371-1.293-.134-2.678-.547-1.515-1.413-1.881-1.344-1.997.297-.5 1.038-1.297 1.334-2.78.176-.899.13-2.377-.269-3.151-.074-.144-.732.241-.732.241s-.616-1.371-.788-1.483a.271.271 0 0 0-.157-.046z"
				fill="currentColor"
			/>
		</svg>
	),
	pnpm: (props: IconProps) => (
		<svg viewBox="0 0 24 24" {...props}>
			<path
				d="M0 0v7.5h7.5V0zm8.25 0v7.5h7.498V0zm8.25 0v7.5H24V0zM8.25 8.25v7.5h7.498v-7.5zm8.25 0v7.5H24v-7.5zM0 16.5V24h7.5v-7.5zm8.25 0V24h7.498v-7.5zm8.25 0V24H24v-7.5z"
				fill="currentColor"
			/>
		</svg>
	),
	google: (props: IconProps) => (
		<svg role="img" viewBox="0 0 24 24" {...props}>
			<path
				fill="currentColor"
				d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
			/>
		</svg>
	),
	apple: (props: IconProps) => (
		<svg role="img" viewBox="0 0 24 24" {...props}>
			<path
				d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
				fill="currentColor"
			/>
		</svg>
	),
	spinner: (props: IconProps) => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path d="M21 12a9 9 0 1 1-6.219-8.56" />
		</svg>
	),
};
