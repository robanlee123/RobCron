<?php

for($i =0; $i < mt_rand(10, 30); $i ++)
{
	echo sprintf('Hello world: %s %s',$i,PHP_EOL);
}

die(0);